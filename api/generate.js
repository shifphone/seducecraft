import { createClient } from '@supabase/supabase-js';

const rateMap = new Map();
function rateLimit(key, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const entry = rateMap.get(key) || { count: 0, start: now };
  if (now - entry.start > windowMs) { entry.count = 0; entry.start = now; }
  entry.count++;
  rateMap.set(key, entry);
  return entry.count <= limit;
}

export default async function handler(req, res) {
  if (req.query?.check === '1') {
    const result = await checkQuality(req.body?.imageUrl, req.body?.charPhotos, req.body?.templateUrl);
    return res.status(200).json(result);
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  // rate limit disabled

  const apiKey = process.env.XMODE_API_KEY;
  const civitaiKey = process.env.CIVITAI_API_KEY;

  const supabaseUrl = process.env.seducecraft_SUPABASE_URL || process.env.NEXT_PUBLIC_seducecraft_SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.seducecraft_SUPABASE_SECRET_KEY || process.env.seducecraft_SUPABASE_SERVICE_ROLE_KEY || process.env.seducecraft_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_seducecraft_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_seducecraft_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const keys = Object.keys(process.env).filter(k => k.toLowerCase().includes('supabase') || k.toLowerCase().includes('xmode'));
    return res.status(500).json({ error: 'Supabase not configured on server', available: keys });
  }

  const { prompt, endUserEmail, model, n, referenceBase64, references, action, userId, name, photos } = req.body || {};
  
  // Character operations
  if (action === 'saveCharacter') {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('anon_characters').insert({ user_id: userId, name, photos }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
  if (action === 'deleteCharacter') {
    const { id } = req.body;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.from('anon_characters').delete().eq('id', id).eq('user_id', userId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }
  if (action === 'updateCharacter') {
    const { id, photos: newPhotos } = req.body;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.from('anon_characters').update({ photos: newPhotos }).eq('id', id).eq('user_id', userId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }
  if (action === 'loadCharacters') {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('anon_characters').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data || []);
  }
  if (action === 'saveGallery') {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { item } = req.body;
    const row = {
      user_id: userId,
      title: item.title || null,
      prompt: item.prompt || null,
      character_name: item.characterName || null,
      src: item.src,
      model: item.model || null,
      size: item.size || null
    };
    const { data, error } = await supabase.from('anon_gallery').insert(row).select().single();
    if (error) return res.status(500).json({ error: error.message, details: error });
    return res.status(200).json(data);
  }
  if (action === 'loadGallery') {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('anon_gallery').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    const mapped = (data || []).map(d => ({
      id: d.id,
      title: d.title,
      prompt: d.prompt,
      characterName: d.character_name,
      src: d.src,
      model: d.model,
      size: d.size,
      createdAt: new Date(d.created_at).getTime()
    }));
    return res.status(200).json(mapped);
  }
  if (action === 'deleteGallery') {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { id } = req.body;
    const { error } = await supabase.from('anon_gallery').delete().eq('id', id).eq('user_id', userId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }
  
  if (!prompt) return res.status(400).json({ error: 'prompt required' });

  const email = endUserEmail || 'anon@seducecraft.app';

  let refUrls = [];
  const base64List = Array.isArray(referenceBase64) ? referenceBase64 : (referenceBase64 ? [referenceBase64] : []);
  const supabase = createClient(supabaseUrl, supabaseKey);
  // Upload base64 first so character photos are image_1
  for (const b64 of base64List) {
    if (b64 && b64.startsWith('data:')) {
      try {
        const base64 = b64.split(',')[1];
        const mime = b64.match(/data:(.*?);/)?.[1] || 'image/jpeg';
        const buf = Buffer.from(base64, 'base64');
        const ext = mime.includes('png') ? 'png' : 'jpg';
        const fileName = `ref-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from('references').upload(fileName, buf, { contentType: mime, upsert: false });
        if (error) return res.status(500).json({ error: error.message });
        const { data } = supabase.storage.from('references').getPublicUrl(fileName);
        refUrls.push(data.publicUrl);
      } catch (e) {
        return res.status(500).json({ error: e.message });
      }
    }
  }
  // Then add URL references (template images)
  const urlRefs = Array.isArray(references) ? references : (references ? [references] : []);
  refUrls.push(...urlRefs);
  if (!refUrls.length) return res.status(400).json({ error: 'No reference' });
  const refUrl = refUrls;

  const charCount = base64List.length - 1;
  const templateIdx = charCount + 1;
  const cleanPrompt = prompt.replace(/image_\d+/gi, 'the template').replace(/images?\s*\d+(-\d+)?/gi, 'the template');
const finalPrompt = model === 'xSD5Pro' 
    ? cleanPrompt
    : `Use the first ${charCount} images strictly for face identity only. Do not copy body, skin tone, tattoos, or any non-facial features from these images.
Use the last image as the reference for the exact pose, body position, clothing, environment, lighting, camera angle, and all sexual elements. Copy everything visible in the last image as accurately as possible, including all genitalia and intimate body contact.
Do not copy from the last image: tattoos, dental braces, scars, birthmarks, body proportions, or skin tone.
${cleanPrompt}
Amateur smartphone photography, medium-to-low image quality, casual unpolished snapshot, moderate softness, subtle digital noise, visible fine grain, slight JPEG compression artifacts, imperfect focus, uneven natural ambient lighting, slightly inaccurate white balance, imperfect exposure, realistic unretouched textures, ordinary consumer-camera rendering, natural everyday colors, slightly awkward framing, no professional studio lighting, no cinematic color grading, no beauty retouching, no glossy editorial finish, no artificial HDR, no excessive sharpness, no CGI appearance.`;

  // Civitai NSFW path
  if (model === 'civitai-nsfw' || model === 'civitai') {
    if (!civitaiKey) return res.status(500).json({ error: 'CIVITAI_API_KEY not configured' });
    const loras = {
      "urn:air:flux1:lora:civitai:674027@780667": 0.8,
      "urn:air:flux1:lora:civitai:1219805@1414074": 1.0,
      "urn:air:flux1:lora:civitai:796605@890793": 0.85
    };
    const workflow = {
      steps: [{
        "$type": "imageGen",
        input: {
          engine: "flux2",
          model: "klein",
          operation: "createImage",
          modelVersion: "4b",
          prompt: finalPrompt,
          negativePrompt: "clothed, underwear, bra, panties, censored, mosaic, blur, professional photography, studio lighting, glossy, HDR, oversharpened, plastic skin, bad anatomy, deformed, extra limbs",
          width: 1024,
          height: 1024,
          steps: 25,
          cfgScale: 5,
          quantity: Math.min(Math.max(parseInt(n) || 1, 1), 4),
          loras
        }
      }]
    };
    try {
      const createRes = await fetch("https://orchestration.civitai.com/v2/consumer/workflows?wait=0", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${civitaiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(workflow)
      });
      if (!createRes.ok) {
        const err = await createRes.text();
        return res.status(createRes.status).json({ error: err });
      }
      const { id: workflowId } = await createRes.json();
      for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 3000));
        const pollRes = await fetch(`https://orchestration.civitai.com/v2/consumer/workflows/${workflowId}`, {
          headers: { "Authorization": `Bearer ${civitaiKey}` }
        });
        if (!pollRes.ok) continue;
        const data = await pollRes.json();
        if (data.status === "succeeded") {
          const img = data.steps?.[0]?.output?.images?.[0];
          const url = img?.url;
          return res.status(200).json({ url, requestId: workflowId, images: [img], cost: 1 });
        }
        if (data.status === "failed") {
          return res.status(500).json({ error: "Civitai generation failed", full: data });
        }
      }
      return res.status(504).json({ error: "Timeout" });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // Default xMode path
  if (!apiKey) return res.status(500).json({ error: 'XMODE_API_KEY not configured' });

  const body = {
    model: model || 'xSD4.5',
    prompt: finalPrompt,
    endUserEmail: email,
    n: Math.min(Math.max(parseInt(n) || 1, 1), 7),
    size: req.body.size || '2048x2048',
    references: Array.isArray(refUrl) ? refUrl : [refUrl],
  };
  if (model !== 'xSD5Pro') {
    body.guidanceScale = req.body.prompt?.includes('image_1') ? 10 : (req.body.guidanceScale || 10);
  }
  if (req.body.sequential && model !== 'xSD5Pro') {
    body.sequential = req.body.sequential;
    body.sequentialOptions = { maxImages: Math.min(Math.max(parseInt(n) || 1, 1), 15) };
  }

  try {
    const createRes = await fetch('https://api.xmode.ai/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!createRes.ok) {
      const err = await createRes.text();
      return res.status(createRes.status).json({ error: err });
    }
    const { requestId } = await createRes.json();
    for (let i = 0; i < 90; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const pollRes = await fetch(`https://api.xmode.ai/v1/generations/${requestId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      if (!pollRes.ok) continue;
      const data = await pollRes.json();
      if (data.status === 'succeeded') {
        const images = data.images || data.output?.images || [];
        const url = images[0]?.url || images[0] || data.output?.url;
        const cost = data.cost?.xTokens || data.cost || 1;
        return res.status(200).json({ url, requestId, images, cost });
      }
      if (data.status === 'failed' || data.status === 'expired') {
        const errDetail = data.error?.message || data.error?.code || JSON.stringify(data.error || data);
        return res.status(500).json({ error: errDetail, full: data, requestId });
      }
    }
    return res.status(504).json({ error: 'Timeout' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}


// v2
export async function checkQuality(imageUrl, charPhotos, templateUrl) {
  const key = process.env.OPENROUTER_KEY;
  if (!key) return { ok: true, error: 'no key', debug: 'no_key' };
  
  const content = [
    { type: 'text', text: 'You are checking an AI-generated image for quality issues. You will see: 1) the generated image, 2) character reference photos (face should match these), 3) the template photo.\nReply ONLY in this exact format. Do not write anything else. Do not explain. Do not add extra lines:\nDESCRIPTION: [1 sentence what you see]\nISSUE: Yes or No\nDETAILS: [exact problem if Yes, or none]\nMark ISSUE: Yes if you see ANY of these:\n- Genitals: If a penis is visible, it clearly looks like a finger or hand. Concrete signs that MUST be present: visible fingernail, more than one distinct tip/digit, segmented like a finger with joints, or a hand with multiple fingers attached to the crotch. Do NOT flag just because the penis lacks a distinct glans or coronal ridge — poor rendering is not the same as looking like a finger.\n- Extra limbs: more than 2 arms or more than 2 legs.\n- Broken or deformed limbs: knee bent backwards, foot twisted or rotated wrong way, elbow twisted, arm or leg disconnected from the torso, extra joints, limb in anatomically impossible position.\n- Hands or feet: extra fingers, missing fingers, fused fingers, extra toes, missing toes, or hands that look like they are merging with the genitals.\n- Face does not match character reference photos: the face still looks like the person from the template photo, or key features (eye shape, nose, jaw, hairline) clearly do not match the character references.\n- Body parts merged incorrectly, missing, or duplicated (e.g. two torsos, missing limbs, fused body parts).\nBe strict about anatomy. A leg that bends at the wrong place, a foot that looks twisted, or a penis that looks like a finger is always an ISSUE.\nExamine the genital area first. Then check each limb separately (left arm, right arm, left leg, right leg). Then compare the face to the character references.' },
    { type: 'text', text: 'GENERATED IMAGE:' },
    { type: 'image_url', image_url: { url: imageUrl } }
  ];
  
  if (Array.isArray(charPhotos) && charPhotos.length) {
    content.push({ type: 'text', text: 'CHARACTER REFERENCE PHOTOS (face should match these):' });
    for (const u of charPhotos.slice(0, 3)) content.push({ type: 'image_url', image_url: { url: u } });
  }
  if (templateUrl) {
    content.push({ type: 'text', text: 'TEMPLATE PHOTO (original pose, face should be replaced):' });
    content.push({ type: 'image_url', image_url: { url: templateUrl } });
  }
  
  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'x-ai/grok-4.7', messages: [{ role: 'user', content }] })
    });
    const data = await r.json();
    const text = (data.choices?.[0]?.message?.content || '').toLowerCase();
    const debug = { status: r.status, error: data.error, text: text.slice(0, 150) };
    const desc = text.match(/description:\s*(.+?)(?=\n|ISSUE|$)/i)?.[1]?.trim() || text.slice(0, 120);
    const details = text.match(/details:\s*(.+?)(?=\n|$)/i)?.[1]?.trim() || '';
    const issueMatch = text.match(/issue:\s*(yes|no)/i);
    const hasIssue = issueMatch?.[1]?.toLowerCase() === 'yes' && details && details.toLowerCase() !== 'none';
    return { ok: !hasIssue, score: hasIssue ? 3 : 8, issues: hasIssue ? [details] : [], debug: desc + (details ? ' | ' + details : '') };
  } catch (e) {
    return { ok: true, error: e.message, debug: 'catch:' + e.message };
  }
}
