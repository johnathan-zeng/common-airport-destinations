// api/proxy.js
export default async function handler(req, res) {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    res.status(400).json({ error: 'Missing url parameter' });
    return;
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AirportDestComparator/1.0)',
        'Accept': 'text/html',
      },
    });

    const contentType = response.headers.get('content-type') || 'text/html';
    const body = await response.text();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*'); // Enable CORS
    res.status(200).send(body);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
