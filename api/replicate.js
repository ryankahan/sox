const handler = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const REPLICATE_TOKEN = process.env.REPLICATE_TOKEN;
  if (!REPLICATE_TOKEN) return res.status(500).json({ error: 'REPLICATE_TOKEN not configured' });

  // Return token so browser can upload directly to Replicate
  if (req.method === 'GET' && req.query.action === 'token') {
    return res.status(200).json({ token: REPLICATE_TOKEN });
  }

  // Poll prediction status
  if (req.method === 'GET') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing prediction id' });
    const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { 'Authorization': `Token ${REPLICATE_TOKEN}` },
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  }

  // Start prediction (small JSON body — just URLs, no base64)
  if (req.method === 'POST') {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

module.exports = handler;
