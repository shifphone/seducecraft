export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = process.env.NOTION_API_KEY;
  const dbId = process.env.NOTION_DATABASE_ID || '1b4a358ee82e47eb89051b2dbb1fd4d4';
  if (!token) {
    return res.status(200).json({ templates: [], error: 'NOTION_API_KEY not set', fallback: true });
  }

  try {
    const r = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page_size: 100 }),
    });
    if (!r.ok) {
      const err = await r.text();
      return res.status(200).json({ templates: [], error: err, fallback: true });
    }
    const data = await r.json();
    const templates = (data.results || []).map(page => {
      const props = page.properties || {};
      const title = props['Название']?.title?.[0]?.plain_text || page.id.slice(0, 8);
      const prompt = props['Промпт']?.rich_text?.[0]?.plain_text || props['Промпт']?.title?.[0]?.plain_text || '';
      if (!prompt || /faceid:/i.test(prompt)) return null;

      const loc = (props['Локация']?.multi_select || []).map(o => o.name);
      const pose = (props['Позиция']?.multi_select || []).map(o => o.name);
      const angle = (props['Ракурс']?.multi_select || []).map(o => o.name);
      const clothing = (props['Одежда']?.multi_select || []).map(o => o.name);
      const tags = (props['Тэги']?.multi_select || []).map(o => o.name);

      const categories = [...new Set([...loc, ...pose, ...angle, ...clothing, ...tags])].filter(Boolean);

      return {
        id: page.id,
        title: { en: title, ru: title },
        prompt,
        src: `/api/template-image?id=${page.id}`,
        tags: categories,
        categories,
      };
    }).filter(Boolean);

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ templates, count: templates.length });
  } catch (e) {
    return res.status(200).json({ templates: [], error: String(e.message || e), fallback: true });
  }
}
