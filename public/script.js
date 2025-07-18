// Escape HTML helper
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Search Wikipedia API to get airport article URL
async function getWikipediaUrl(code) {
  console.log(`Searching Wikipedia for airport code: ${code}`);
  const query = `airport ${code}`;
  const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;

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
    throw new Error(`Failed to search Wikipedia for ${code}: ${err.message}`);
  }
}

// Parse Wikipedia HTML to extract passenger-only airline tables
function parseHtml(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const airlineMap = new Map();
  const allDests = new Set();

  const headings = Array.from(doc.querySelectorAll("h2, h3, h4, h5, h6"));
  for (let i = 0; i < headings.length; i++) {
    const headingText = headings[i].textContent.toLowerCase();

    if (headingText.includes("airlines and destinations")) {
      for (let j = i + 1; j < headings.length; j++) {
        const subHeadingText = headings[j].textContent.toLowerCase();

        if (subHeadingText.includes("cargo") || subHeadingText.includes("freight")) break;

        if (subHeadingText.includes("passenger")) {
          let el = headings[j].nextElementSibling;
          while (el && !/^H[2-6]$/.test(el.tagName)) {
            if (el.tagName === "TABLE" && el.classList.contains("wikitable")) {
              processTable(el, airlineMap, allDests);
            }
            el = el.nextElementSibling;
          }
          break;
        }
      }
      break;
    }
  }

  if (allDests.size > 0) {
    airlineMap.set("__ALL__", allDests);
  }

  return airlineMap;
}

// Helper to extract destinations from table rows
function processTable(table, airlineMap, allDests) {
  const rows = table.querySelectorAll("tr");
  rows.forEach((row, idx) => {
    if (idx === 0) return;
    const cols = row.querySelectorAll("td");
    if (cols.length < 2) return;

    const airline = cols[0].textContent.trim();
    if (!airline || airline.length < 2 || /^\d+$/.test(airline)) return;

    let destText = cols[1].textContent || "";
    destText = destText
      .replace(/\[\d+\]/g, '')
      .re
