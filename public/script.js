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

  try {
    console.log(`Searching Wikipedia for airport code: ${code}`);
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`Wikipedia API error: ${res.status}`);

    const json = await res.json();
    const firstResult = json.query?.search?.[0];

    if (!firstResult) throw new Error(`No Wikipedia page found for airport code: ${code}`);

    const title = firstResult.title;
    console.log(`Found Wikipedia page for ${code}: ${title}`);
    return `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
  } catch (err) {
    throw new Error(`Failed to search Wikipedia for ${code}: ${err.message}`);
  }
}

// Parse Wikipedia HTML, extract passenger destination tables only
function parseHtml(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Step 1: find <h2> Airlines and destinations
  const h2s = [...doc.querySelectorAll("h2")];
  let targetH2 = h2s.find(h2 =>
    h2.id.toLowerCase() === "airlines_and_destinations" ||
    h2.textContent.toLowerCase().includes("airlines and destinations")
  );
  if (!targetH2) {
    console.warn("No <h2> 'Airlines and destinations' found");
    return new Map();
  }

  // Step 2: find next <h3> Passenger after that h2
  let el = targetH2.nextElementSibling;
  let targetH3 = null;
  while (el) {
    if (el.tagName === "H3" &&
        (el.id.toLowerCase() === "passenger" || el.textContent.toLowerCase().includes("passenger"))) {
      targetH3 = el;
      break;
    }
    // stop if next <h2> found before <h3> passenger
    if (el.tagName === "H2") break;
    el = el.nextElementSibling;
  }

  if (!targetH3) {
    console.warn("No <h3> 'Passenger' found after Airlines and destinations");
    return new Map();
  }

  // Step 3: collect all wikitable tables after <h3> Passenger until next heading
  const tables = [];
  el = targetH3.nextElementSibling;
  while (el && !(/^H[1-6]$/i.test(el.tagName))) {
    if (el.tagName === "TABLE" && el.classList.contains("wikitable")) {
      tables.push(el);
    }
    el = el.nextElementSibling;
  }

  if (tables.length === 0) {
    console.warn("No wikitable passenger tables found after <h3> Passenger");
    return new Map();
  }

  // Step 4: parse tables for airline and destinations, applying alphabetical reset filtering
  const airlineMap = new Map();
  const allDests = new Set();

  tables.forEach((table) => {
    const rows = [...table.querySelectorAll("tr")];

    let lastFirstChar = null;
    const filteredRows = [];

    for (let i = 1; i < rows.length; i++) { // skip header row at i=0
      const row = rows[i];
      const cols = row.querySelectorAll("td");
      if (cols.length < 2) continue;

      const airline = cols[0].textContent.trim();
      if (!airline) continue;

      const firstChar = airline[0].toUpperCase();

      // If alphabetical reset detected, stop processing further rows for this table
      if (lastFirstChar && firstChar < lastFirstChar) {
        console.log(`Alphabetical reset detected at airline "${airline}", stopping row parsing for this table.`);
        break;
      }
      lastFirstChar = firstChar;

      filteredRows.push(row);
    }

    // Process filtered rows
    filteredRows.forEach((row) => {
      const cols = row.querySelectorAll("td");
      const airline = cols[0].textContent.trim();
      if (!airline || airline.length < 2) return;

      let destText = cols[1].textContent || "";

      destText = destText
        .replace(/\[\d+\]/g, '')      // remove references
        .replace(/\([^)]+\)/g, '')    // remove parentheses content
        .replace(/–/g, '-')           // normalize dash
        .replace(/\s{2,}/g, ' ')      // collapse spaces
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
      }
    });
  });

  if (allDests.size > 0) {
    airlineMap.set("__ALL__", allDests);
  }

  console.log(`Parsed ${tables.length} tables, extracted ${allDests.size} unique destinations`);

  return airlineMap;
}

// Try multiple public CORS proxies in sequence until success
async function fetchDestinations(url) {
  const proxies = [
    "https://common-airport-destinations.vercel.app/api/proxy?url=", // Your Vercel proxy first
    "https://api.allorigins.win/get?url=",
    "https://corsproxy.io/?",
    "https://api.codetabs.com/v1/proxy?quest=",
    "https://thingproxy.freeboard.io/fetch/",
  ];

  let lastError = null;

  for (const proxy of proxies) {
    try {
      const proxyUrl = proxy + encodeURIComponent(url);
      console.log(`Trying proxy: ${proxyUrl}`);

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
      console.warn(`Proxy failed (${proxy}): ${err.message}`);
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

    console.log(`Got Wikipedia URLs:`);
    console.log(`${code1}: ${url1}`);
    console.log(`${code2}: ${url2}`);

    output.innerHTML = `<div class="loading">Fetching destination data...</div>`;

    // Fetch and parse destination tables
    const [map1, map2] = await Promise.all([fetchDestinations(url1), fetchDestinations(url2)]);

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
