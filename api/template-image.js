export default async function handler(req, res) {
  const token = process.env.NOTION_API_KEY;
  const id = req.query.id;
  if (!token || !id) return res.status(400).send('missing');

  try {
    const r = await fetch(`https://api.notion.com/v1/pages/${id}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Notion-Version': '2022-06-28' },
    });
    if (!r.ok) return res.status(404).send('not found');
    const page = await r.json();
    const files = page.properties?.['Референс фото']?.files || [];
    const file = files[0];
    const url = file?.file?.url || file?.external?.url;
    if (!url) return res.status(404).send('no image');

    const img = await fetch(url);
    if (!img.ok) return res.status(502).send('image fetch failed');
    const buf = Buffer.from(await img.arrayBuffer());
    const ct = img.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(buf);
  } catch (e) {
    return res.status(500).send(String(e.message || e));
  }
}
