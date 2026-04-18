const handler = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const REPLICATE_TOKEN = process.env.REPLICATE_TOKEN;
  if (!REPLICATE_TOKEN) return res.status(500).json({ error: 'REPLICATE_TOKEN not configured' });
  if (req.method === 'POST' && req.query.action === 'upload') {
    const { data, type } = req.body;
    const buffer = Buffer.from(data, 'base64');
    const boundary = '----FormBoundary' + Math.random().toString(36);
    const ext = type.includes('jpeg') ? 'jpg' : 'png';
    const header = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="content"; filename="image.${ext}"\r\nContent-Type: ${type}\r\n\r\n`);
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([header, buffer, footer]);
    const response = await fetch('https://api.replicate.com/v1/files', {
      method: 'POST',
      headers: { 'Authorization': `Token ${REPLICATE_TOKEN}`, 'Content-Type': `multipart/form-data; boundary=${boundary}`, 'Content-Length': body.length },
      body,
    });
    const result = await response.json();
    if (!response.ok) return res.status(response.status).json(result);
    return res.status(200).json({ url: result.urls?.get || result.url });
  }
  if (req.method === 'GET') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing prediction id' });
    const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, { headers: { 'Authorization': `Token ${REPLICATE_TOKEN}` } });
    const data = await response.json();
    return res.status(response.status).json(data);
  }
  if (req.method === 'POST') {
    const { model, version, input } = req.body;
    const endpoint = model
      ? `https://api.replicate.com/v1/models/${model}/predictions`
      : 'https://api.replicate.com/v1/predictions';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Authorization': `Token ${REPLICATE_TOKEN}`, 'Content-Type': 'application/json', 'Prefer': 'wait' },
      body: JSON.stringify(model ? { input } : { version, input }),
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  }
  return res.status(405).json({ error: 'Method not allowed' });
};
handler.config = { api: { bodyParser: { sizeLimit: '10mb' } } };
module.exports = handler;
