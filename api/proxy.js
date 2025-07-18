export default async function handler(req, res) {
  console.log('Proxy handler started');
  const targetUrl = req.query.url;
  console.log('Target URL:', targetUrl);

  if (!targetUrl) {
    console.log('Missing url parameter');
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'text/html'
      }
    });
    console.log('Fetched target URL, status:', response.status);

    const contentType = response.headers.get('content-type');
    const body = await response.text();

    res.setHeader('Content-Type', contentType || 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log('Sending response...');
    res.status(200).send(body);
  } catch (error) {
    console.error('Error in proxy handler:', error);
    res.status(500).json({ error: error.message });
  }
}
