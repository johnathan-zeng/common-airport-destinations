export default async function handler(req, res) {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'text/html'
      }
    });

    const contentType = response.headers.get('content-type');
    const body = await response.text();

    res.setHeader('Content-Type', contentType || 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(body);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
