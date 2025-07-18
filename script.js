// Escape HTML helper
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Search Wikipedia API to get airport article URL (supports CORS)
async function getWikipediaUrl(code) {
  const query = `airport ${code}`;
  const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;

  console.log(`Searching Wikipedia for airport code: ${code}`);

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`Wikipedia API error: ${res.status}`);

    const json = await res.json();
    const firstResult = json.query?.search?.[0];

    if (!firstResult) throw new Error(`No Wikipedia page found for airport code: ${code}`);

    const title = firstResult.title;
    console.log(`Found Wikipedia page for ${code}: ${title}`);
    return `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
  } catch (err) {
    console.error(`Failed to search Wikipedia for ${code}: ${err.message}`);
    throw new Error(`Failed to search Wikipedia for ${code}: ${err.message}`);
  }
}

// Parse Wikipedia HTML, extract passenger destination tables only
function parseHtml(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const tables = doc.querySelectorAll("table.wikitable");

  console.log(`Parsing HTML: found ${tables.length} wikitable elements`);

  const airlineMap = new Map();
  const allDests = new Set();

  tables.forEach((table, i) => {
    const caption = table.querySelector("caption");
    const captionText = caption ? caption.textContent.toLowerCase() : "";

    if (!captionText.includes("passenger") && !hasPassengerHeading(table)) {
      console.log(`Skipping table ${i} - no 'passenger' caption or heading`);
      return;
    }

    const rows = table.querySelectorAll("tr");
    console.log(`Processing table ${i} with ${rows.length} rows`);

    rows.forEach((row, idx) => {
      if (idx === 0) return; // skip header

      const cols = row.querySelectorAll("td");
      if (cols.length < 2) return;

      const airline = cols[0].textContent.trim();
      if (!airline || airline.length < 2) return;

      let destText = cols[1].textContent || "";

      destText = destText
        .replace(/\[\d+\]/g, '')
        .replace(/\([^)]+\)/g, '')
        .replace(/–/g, '-')
        .replace(/\s{2,}/g, ' ')
        .trim();

      const dests = destText
        .split(/[\n,;·•]/)
        .map(d => d.trim())
        .filter(d =>
          d.length >= 3 &&
          d.length < 50 &&
          !/^\d+$/.test(d) &&
          !/[0-9]{3,}/.test(d) &&
          !/^\d{2,}[a-z]?$/i.test(d) &&
          !/^(and|or|also|via|seasonal|charter|cargo|freight|terminated|suspended)$/i.test(d)
        );

      if (dests.length > 0) {
        if (!airlineMap.has(airline)) airlineMap.set(airline, new Set());
        dests.forEach(d => {
          airlineMap.get(airline).add(d);
          allDests.add(d);
        });
        console.log(`Table ${i} Row ${idx}: Airline '${airline}' with destinations: ${dests.join(", ")}`);
      }
    });
  });

  if (allDests.size > 0) {
    airlineMap.set("__ALL__", allDests);
    console.log(`Collected total unique destinations: ${allDests.size}`);
  } else {
    console.warn("No passenger destination data extracted from HTML");
  }

  return airlineMap;
}

// Check if a heading before the table mentions "passenger"
function hasPassengerHeading(table) {
  let el = table.previousElementSibling;
  let count = 0;
  while (el && count < 5) {
    if (/^H[1-6]$/i.test(el.tagName)) {
      return el.textContent.toLowerCase().includes("passenger");
    }
    el = el.previousElementSibling;
    count++;
  }
  return false;
}

// Try multiple public CORS proxies in sequence until success
const myProxyBaseUrl = 'https://common-airport-destinations.vercel.app/api/proxy?url=';

async function fetchDestinations(url) {
  const publicProxies = [
    "https://api.allorigins.win/get?url=",
    "https://corsproxy.io/?",
    "https://api.codetabs.com/v1/proxy?quest=",
    "https://thingproxy.freeboard.io/fetch/",
  ];

  let lastError = null;

  // Try your own proxy first
  try {
    const proxyUrl = myProxyBaseUrl + encodeURIComponent(url);
    console.log(`Trying my Vercel proxy: ${proxyUrl}`);

    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status} at my proxy`);

    const html = await res.text();
    if (!html || html.length < 100) throw new Error('Empty or invalid response from my proxy');

    const parsed = parseHtml(html);
    if (parsed.size > 0) return parsed;

    throw new Error('No destination data found in page via my proxy');
  } catch (err) {
    console.warn(`My proxy failed: ${err.message}`);
    lastError = err;
  }

  // If my proxy fails, try public proxies in order
  for (const proxy of publicProxies) {
    try {
      const proxyUrl = proxy + encodeURIComponent(url);
      console.log(`Trying public proxy: ${proxy}`);

      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status} at proxy: ${proxy}`);

      let html;
      if (proxy.includes("allorigins")) {
        const json = await res.json();
        html = json.contents;
      } else {
        html = await res.text();
      }

      if (!html || html.length < 100) throw new Error('Empty or invalid response');

      const parsed = parseHtml(html);
      if (parsed.size > 0) return parsed;

      throw new Error('No destination data found in page');
    } catch (err) {
      console.warn(`Public proxy failed (${proxy}): ${err.message}`);
      lastError = err;
    }
  }

  throw new Error(`All proxies failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

// Merge airline destination sets for comparison
function mergeAirlines(map1, map2) {
  const airlineSet = new Set([...map1.keys(), ...map2.keys()]);
  const result = [];

  airlineSet.forEach((airline) => {
    const d1 = map1.get(airline) || new Set();
    const d2 = map2.get(airline) || new Set();

    const common = [...d1].filter((x) => d2.has(x));
    const only1 = [...d1].filter((x) => !d2.has(x));
    const only2 = [...d2].filter((x) => !d1.has(x));

    if (common.length || only1.length || only2.length) {
      result.push({
        airline: airline === "__ALL__" ? "All Airlines" : airline,
        common: common.sort(),
        only1: only1.sort(),
        only2: only2.sort(),
      });
    }
  });

  // Move "All Airlines" to the front
  const allIndex = result.findIndex((r) => r.airline === "All Airlines");
  if (allIndex > -1) {
    const [allRow] = result.splice(allIndex, 1);
    result.unshift(allRow);
  }

  return result.sort((a, b) => {
    if (a.airline === "All Airlines") return -1;
    if (b.airline === "All Airlines") return 1;
    return a.airline.localeCompare(b.airline);
  });
}

// Main function to compare destinations
async function compareDestinations() {
  const code1 = document.getElementById("code1").value.trim().toUpperCase();
  const code2 = document.getElementById("code2").value.trim().toUpperCase();
  const output = document.getElementById("output");
  const button = document.querySelector("button");

  if (!code1 || !code2) {
    output.innerHTML = `<div class="error">Please enter both airport codes.</div>`;
    return;
  }
  if (code1.length < 3 || code2.length < 3) {
    output.innerHTML = `<div class="error">Please enter valid airport codes (3+ characters).</div>`;
    return;
  }
  if (code1 === code2) {
    output.innerHTML = `<div class="error">Please enter two different airport codes.</div>`;
    return;
  }

  output.innerHTML = `<div class="loading">Searching for Wikipedia pages...</div>`;
  button.disabled = true;

  try {
    // Search Wikipedia for each airport page URL
    const [url1, url2] = await Promise.all([getWikipediaUrl(code1), getWikipediaUrl(code2)]);

    console.log(`Got Wikipedia URLs:\n${code1}: ${url1}\n${code2}: ${url2}`);

    output.innerHTML = `<div class="loading">Fetching destination data...</div>`;

    // Fetch and parse destination tables
    const [map1, map2] = await Promise.all([fetchDestinations(url1), fetchDestinations(url2)]);

    console.log(`Parsed destination maps sizes: ${map1.size}, ${map2.size}`);

    if (map1.size === 0 && map2.size === 0) {
      output.innerHTML = `<div class="error">No passenger destination data found for either airport.</div>`;
      return;
    }

    const merged = mergeAirlines(map1, map2);

    if (merged.length === 0) {
      output.innerHTML = `<div class="warning">No comparable airline data found between the two airports.</div>`;
      return;
    }

    // Build and display results table
    let html = `
      <h3>Destination Comparison: ${escapeHtml(code1)} vs ${escapeHtml(code2)}</h3>
      <table>
        <thead>
          <tr>
            <th>Airline</th>
            <th>Common Destinations</th>
            <th>Only at ${escapeHtml(code1)}</th>
            <th>Only at ${escapeHtml(code2)}</th>
          </tr>
        </thead>
        <tbody>
    `;

    merged.forEach(({ airline, common, only1, only2 }) => {
      html += `
        <tr>
          <td><strong>${escapeHtml(airline)}</strong></td>
          <td>${common.length ? escapeHtml(common.join(", ")) : '<span class="empty-cell">None</span>'}</td>
          <td>${only1.length ? escapeHtml(only1.join(", ")) : '<span class="empty-cell">None</span>'}</td>
          <td>${only2.length ? escapeHtml(only2.join(", ")) : '<span class="empty-cell">None</span>'}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
      <div class="warning">
        <strong>Note:</strong> Data is sourced from Wikipedia passenger destination tables.
        Results depend on the completeness of Wikipedia data.
      </div>
    `;

    output.innerHTML = html;
  } catch (err) {
    console.error("Error:", err);
    output.innerHTML = `<div class="error">Error: ${escapeHtml(err.message)}</div>`;
  } finally {
    button.disabled = false;
  }
}

// Support Enter key to trigger comparison
document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll("input[type='text']");
  inputs.forEach((input) => {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        compareDestinations();
      }
    });
  });
});
