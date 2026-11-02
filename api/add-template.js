export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  
  const token = process.env.NOTION_API_KEY;
  const dbId = process.env.NOTION_DATABASE_ID || '1b4a358ee82e47eb89051b2dbb1fd4d4';
  if (!token) return res.status(500).json({ error: 'No Notion key' });

  const { title, prompt, tags } = req.body || {};
  if (!title || !prompt) return res.status(400).json({ error: 'title and prompt required' });

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  };

  const body = {
    parent: { database_id: dbId },
    properties: {
      'Название': { title: [{ text: { content: title } }] },
      'Промпт': { rich_text: [{ text: { content: prompt } }] },
    },
  };
  if (tags?.length) body.properties['Тэги'] = { multi_select: tags.map(t => ({ name: t })) };

  const r = await fetch('https://api.notion.com/v1/pages', { method: 'POST', headers, body: JSON.stringify(body) });
  const data = await r.json();
  return res.status(r.ok ? 200 : 500).json(data);
}
