// Helper: Escape HTML for safe output
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Helper: Finds the closest previous heading element before a table
function getNearestHeadingText(table) {
  let el = table.previousElementSibling;
  let count = 0;
  while (el && count < 5) {
    if (/^H[1-6]$/i.test(el.tagName)) {
      return el.textContent.trim();
    }
    el = el.previousElementSibling;
    count++;
  }
  return "";
}

// Parses the HTML string of a Wikipedia page, extracting passenger destination tables
function parseHtml(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const tables = doc.querySelectorAll("table.wikitable");

  const airlineMap = new Map();
  const allDests = new Set();

  tables.forEach(table => {
    const caption = table.querySelector("caption");
    const captionText = caption ? caption.textContent.toLowerCase() : "";
    const nearestHeading = getNearestHeadingText(table).toLowerCase();

    // Accept tables if caption or heading contain relevant keywords
    if (
      !captionText.includes("passenger") &&
      !captionText.includes("airline") &&
      !nearestHeading.includes("passenger") &&
      !nearestHeading.includes("airline")
    ) {
      return; // Skip irrelevant tables
    }

    const rows = table.querySelectorAll("tr");
    rows.forEach((row, idx) => {
      if (idx === 0) return; // Skip header row

      const cols = row.querySelectorAll("td");
      if (cols.length < 2) return;

      const airline = cols[0].textContent.trim();
      if (!airline || airline.length < 2) return;

      let destText = cols[1].textContent || "";

      // Clean destination text: remove footnotes, parentheses, normalize dashes and whitespace
      destText = destText
        .replace(/\[\d+\]/g, '')             // remove citations like [1], [2]
        .replace(/\([^)]+\)/g, '')           // remove parentheses content
        .replace(/–/g, '-')                  // normalize dash characters
        .replace(/\s{2,}/g, ' ')             // collapse multiple spaces
        .trim();

      const dests = destText
        .split(/[\n,;·•]/)
        .map(d => d.trim())
        .filter(d =>
          d.length >= 3 &&
          d.length < 50 &&
          !/^\d+$/.test(d) &&                // exclude pure numbers
          !/[0-9]{3,}/.test(d) &&            // exclude long numeric fragments
          !/^\d{2,}[a-z]?$/i.test(d) &&      // exclude things like "267" or "21A"
          !/^(and|or|also|via|seasonal|charter|cargo|freight|terminated|suspended)$/i.test(d)
        );

      if (dests.length > 0) {
        console.log("Airline:", airline, "Destinations:", dests); // Debug log

        if (!airlineMap.has(airline)) airlineMap.set(airline, new Set());
        dests.forEach(d => {
          airlineMap.get(airline).add(d);
          allDests.add(d);
        });
      }
    });
  });

  if (allDests.size > 0) {
    airlineMap.set("__ALL__", allDests);
  }

  return airlineMap;
}

// Fetch Wikipedia URL for given airport code via search API
async function getWikipediaUrl(code) {
  const query = `airport ${code}`;
  const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`Wikipedia API error: ${res.status}`);

    const json = await res.json();
    const firstResult = json.query?.search?.[0];

    if (!firstResult) {
      throw new Error(`No Wikipedia page found for airport code: ${code}`);
    }

    return `https://en.wikipedia.org/wiki/${encodeURIComponent(firstResult.title)}`;
  } catch (err) {
    throw new Error(`Failed to search Wikipedia for ${code}: ${err.message}`);
  }
}

// Attempt to fetch HTML through a list of CORS proxies, return parsed airline data
async function fetchDestinations(url) {
  const proxies = [
    { url: "https://api.allorigins.win/get?url=", isJson: true },
    { url: "https://corsproxy.io/?", isJson: false },
    { url: "https://api.codetabs.com/v1/proxy?quest=", isJson: false },
    { url: "https://thingproxy.freeboard.io/fetch/", isJson: false },
    // Add your own proxy if needed, with or without API keys
  ];

  let lastError = null;

  for (const proxy of proxies) {
    try {
      console.log(`Trying proxy: ${proxy.url}`); // Debug log
      const proxyUrl = proxy.url + encodeURIComponent(url);
      const res = await fetch(proxyUrl, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      let html;
      if (proxy.isJson) {
        const json = await res.json();
        html = json.contents;
      } else {
        html = await res.text();
      }

      if (!html || html.length < 100) throw new Error('Empty or invalid response');

      const parsed = parseHtml(html);
      if (parsed.size > 0) return parsed;
      else throw new Error('No destination data found in page');

    } catch (err) {
      console.warn(`Proxy failed (${proxy.url}):`, err.message);
      lastError = err;
    }
  }

  throw new Error(`All proxies failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

// Merge airline maps from two airports into comparison arrays
function mergeAirlines(map1, map2) {
  const airlineSet = new Set([...map1.keys(), ...map2.keys()]);
  const result = [];

  airlineSet.forEach(airline => {
    const d1 = map1.get(airline) || new Set();
    const d2 = map2.get(airline) || new Set();

    const common = [...d1].filter(x => d2.has(x));
    const only1 = [...d1].filter(x => !d2.has(x));
    const only2 = [...d2].filter(x => !d1.has(x));

    if (common.length || only1.length || only2.length) {
      result.push({
        airline: airline === "__ALL__" ? "All Airlines" : airline,
        common: common.sort(),
        only1: only1.sort(),
        only2: only2.sort()
      });
    }
  });

  // Move "All Airlines" to front
  const allIndex = result.findIndex(r => r.airline === "All Airlines");
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

// Main function to compare destinations between two airport codes
async function compareDestinations() {
  const code1 = document.getElementById("code1").value.trim().toUpperCase();
  const code2 = document.getElementById("code2").value.trim().toUpperCase();
  const output = document.getElementById("output");
  const button = document.querySelector("button");

  // Validate input
  if (!code1 || !code2) {
    output.innerHTML = '<div class="error">Please enter both airport codes.</div>';
    return;
  }

  if (code1.length < 3 || code2.length < 3) {
    output.innerHTML = '<div class="error">Please enter valid airport codes (3+ characters).</div>';
    return;
  }

  if (code1 === code2) {
    output.innerHTML = '<div class="error">Please enter two different airport codes.</div>';
    return;
  }

  output.innerHTML = '<div class="loading">Searching for Wikipedia pages...</div>';
  button.disabled = true;

  try {
    const [url1, url2] = await Promise.all([
      getWikipediaUrl(code1),
      getWikipediaUrl(code2)
    ]);

    output.innerHTML = '<div class="loading">Fetching destination data...</div>';

    const [map1, map2] = await Promise.all([
      fetchDestinations(url1),
      fetchDestinations(url2)
    ]);

    if (map1.size === 0 && map2.size === 0) {
      output.innerHTML = '<div class="error">No passenger destination data found for either airport.</div>';
      return;
    }

    const merged = mergeAirlines(map1, map2);

    if (merged.length === 0) {
      output.innerHTML = '<div class="warning">No comparable airline data found between the two airports.</div>';
      return;
    }

    // Build results table
    let html = `
      <h3>Destination Comparison: ${code1} vs ${code2}</h3>
      <table>
        <thead>
          <tr>
            <th>Airline</th>
            <th>Common Destinations</th>
            <th>Only at ${code1}</th>
            <th>Only at ${code2}</th>
          </tr>
        </thead>
        <tbody>
    `;

    merged.forEach(({ airline, common, only1, only2 }) => {
      const rowClass = airline === "All Airlines" ? "all-airlines" : "";
      html += `
        <tr class="${rowClass}">
          <td><strong>${escapeHtml(airline)}</strong></td>
          <td>${common.length > 0 ? escapeHtml(common.join(", ")) : '<span class="empty-cell">None</span>'}</td>
          <td>${only1.length > 0 ? escapeHtml(only1.join(", ")) : '<span class="empty-cell">None</span>'}</td>
          <td>${only2.length > 0 ? escapeHtml(only2.join(", ")) : '<span class="empty-cell">None</span>'}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
      <div class="warning">
        <strong>Note:</strong> Data is sourced from Wikipedia passenger destination tables. 
        Results may not include all airlines or destinations and depend on the completeness of Wikipedia data.
      </div>
    `;

    output.innerHTML = html;

  } catch (err) {
    console.error('Error:', err);
    output.innerHTML = `<div class="error">Error: ${escapeHtml(err.message)}</div>`;
  } finally {
    button.disabled = false;
  }
}

// Add Enter key support to inputs
document.addEventListener('DOMContentLoaded', () => {
  const inputs = document.querySelectorAll('input[type="text"]');
  inputs.forEach(input => {
    input.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        compareDestinations();
      }
    });
  });
});
