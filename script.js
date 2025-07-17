async function getWikipediaUrl(code) {
  const query = `airport ${code}`;
  const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
  const res = await fetch(apiUrl);
  const json = await res.json();
  const firstResult = json.query.search[0];
  if (!firstResult) throw new Error(`No Wikipedia page found for code: ${code}`);
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(firstResult.title)}`;
}

function parseHtml(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const tables = doc.querySelectorAll("table.wikitable");

  const airlineMap = new Map();
  const allDests = new Set();

  tables.forEach(table => {
    // Check table caption text for "Passenger"
    const caption = table.querySelector("caption");
    const captionText = caption ? caption.innerText.toLowerCase() : "";

    // If caption doesn't mention "passenger", skip table
    if (!captionText.includes("passenger")) {
      // Alternatively, if no caption, check for preceding heading containing "Passenger"
      if (!caption && !hasPassengerHeading(table)) return;
      if (caption && !captionText.includes("passenger")) return;
    }

    const rows = table.querySelectorAll("tr");
    rows.forEach((row, idx) => {
      if (idx === 0) return;
      const cols = row.querySelectorAll("td");
      if (cols.length < 2) return;

      const airline = cols[0].innerText.trim();
      let destText = cols[1].innerText;

      // Remove ALL bracketed citations BEFORE splitting
      destText = destText.replace(/\s*\[\d+\]\s*/g, ', ');

      const dests = destText
        .split(/\n|,|;/)
        .map(d => d.trim())
        .filter(Boolean);

      if (!airlineMap.has(airline)) airlineMap.set(airline, new Set());
      dests.forEach(d => {
        airlineMap.get(airline).add(d);
        allDests.add(d);
      });
    });
  });

  airlineMap.set("__ALL__", allDests);
  return airlineMap;
}

// Helper: check if a previous sibling heading contains "Passenger"
function hasPassengerHeading(table) {
  let el = table.previousElementSibling;
  while (el) {
    if (/^h[1-6]$/i.test(el.tagName)) {
      if (el.innerText.toLowerCase().includes("passenger")) return true;
      else return false;
    }
    el = el.previousElementSibling;
  }
  return false;
}

async function fetchDestinations(url) {
  const proxies = [
    "https://corsproxy.io/?",
    "https://api.codetabs.com/v1/proxy?quest=",
    "https://thingproxy.freeboard.io/fetch/",
    "https://api.allorigins.win/get?url="
  ];

  let lastError = null;
  for (const proxy of proxies) {
    try {
      const fetchUrl = proxy.includes("allorigins") ? proxy + encodeURIComponent(url) : proxy + encodeURIComponent(url);
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

      let html;
      if (proxy.includes("allorigins")) {
        const json = await response.json();
        html = json.contents;
      } else {
        html = await response.text();
      }

      return parseHtml(html);

    } catch (err) {
      console.warn(`Proxy failed: ${proxy}`, err);
      lastError = err;
    }
  }
  throw new Error(`All proxies failed: ${lastError}`);
}

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

  // Move "All Airlines" to the front of the array
  const allIndex = result.findIndex(r => r.airline === "All Airlines");
  if (allIndex > -1) {
    const [allRow] = result.splice(allIndex, 1);
    result.unshift(allRow);
  }

  return result;
}

async function compareDestinations() {
  const code1 = document.getElementById("code1").value.trim().toUpperCase();
  const code2 = document.getElementById("code2").value.trim().toUpperCase();
  const output = document.getElementById("output");
  output.innerHTML = "<p>Loading...</p>";

  try {
    const [url1, url2] = await Promise.all([
      getWikipediaUrl(code1),
      getWikipediaUrl(code2)
    ]);

    const [map1, map2] = await Promise.all([
      fetchDestinations(url1),
      fetchDestinations(url2)
    ]);

    const merged = mergeAirlines(map1, map2);

    let html = `<table><thead><tr>
      <th>Airline</th>
      <th>Common Destinations</th>
      <th>Only at ${code1}</th>
      <th>Only at ${code2}</th>
    </tr></thead><tbody>`;

    merged.forEach(({ airline, common, only1, only2 }) => {
      html += `<tr>
        <td>${airline}</td>
        <td>${common.join(", ") || "-"}</td>
        <td>${only1.join(", ") || "-"}</td>
        <td>${only2.join(", ") || "-"}</td>
      </tr>`;
    });

    html += `</tbody></table>`;
    output.innerHTML = html;
  } catch (err) {
    output.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
  }
}
