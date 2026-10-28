export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = process.env.NOTION_API_KEY;
  const dbId = process.env.NOTION_DATABASE_ID || '1b4a358ee82e47eb89051b2dbb1fd4d4';
  if (!token) return res.status(200).json({ templates: [], error: 'NO_KEY', fallback: true });

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  };

  try {
    let all = [];
    let cursor;
    do {
      const body = { page_size: 100 };
      if (cursor) body.start_cursor = cursor;
      const r = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: 'POST', headers, body: JSON.stringify(body),
      });
      if (!r.ok) {
        const err = await r.text();
        return res.status(200).json({ templates: [], error: err, fallback: true });
      }
      const data = await r.json();
      all = all.concat(data.results || []);
      cursor = data.has_more ? data.next_cursor : null;
    } while (cursor && all.length < 500);

    const templates = all.map(page => {
      const props = page.properties || {};
      const ruTitle = props['Название']?.title?.[0]?.plain_text || page.id.slice(0, 8);
      const prompt = props['Промпт']?.rich_text?.[0]?.plain_text || props['Промпт']?.title?.[0]?.plain_text || '';
      if (!prompt || /faceid:/i.test(prompt)) return null;

      const loc = (props['Локация']?.multi_select || []).map(o => o.name);
      const pose = (props['Позиция']?.multi_select || []).map(o => o.name);
      const angle = (props['Ракурс']?.multi_select || []).map(o => o.name);
      const clothing = (props['Одежда']?.multi_select || []).map(o => o.name);
      const tags = (props['Тэги']?.multi_select || []).map(o => o.name);
      const partner = (props['Партнер']?.multi_select || []).map(o => o.name);
      const sex = (props['Тип секса']?.multi_select || []).map(o => o.name);
      const body = (props['Части тела']?.multi_select || []).map(o => o.name);
      const categories = [...new Set([...loc, ...pose, ...angle, ...clothing, ...tags, ...partner, ...sex, ...body])].filter(Boolean);

      // English title from Notion fields (angle + location + clothing + pose)
      const enBits = [angle[0], loc[0], clothing[0], pose[0]].filter(Boolean);
      const enTitle = enBits.length ? enBits.slice(0, 3).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' · ') : ruTitle;

      return {
        id: page.id,
        title: { en: enTitle, ru: ruTitle },
        prompt,
        src: `/api/template-image?id=${page.id}`,
        tags: categories,
        categories,
      };
    }).filter(Boolean);

    res.setHeader('Cache-Control', 's-maxage=180, stale-while-revalidate=300');
    return res.status(200).json({ templates, count: templates.length });
  } catch (e) {
    return res.status(200).json({ templates: [], error: String(e.message || e), fallback: true });
  }
}
