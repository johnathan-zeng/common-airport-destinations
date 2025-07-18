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
        
        console.log(`Wikipedia page found for ${code}: ${firstResult.title}`);
        return `https://en.wikipedia.org/wiki/${encodeURIComponent(firstResult.title)}`;
    } catch (err) {
        throw new Error(`Failed to search Wikipedia for ${code}: ${err.message}`);
    }
}

// Helper: finds the closest previous heading element before a table
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

function parseHtml(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const tables = doc.querySelectorAll("table.wikitable");

    const airlineMap = new Map();
    const allDests = new Set();

    console.log(`Found ${tables.length} wikitable(s) on page.`);

    tables.forEach((table, idx) => {
        const caption = table.querySelector("caption");
        const captionText = caption ? caption.textContent.toLowerCase() : "";
        const headingText = getNearestHeadingText(table).toLowerCase();

        console.log(`Table #${idx + 1}: caption='${captionText || "<no caption>"}', nearest heading='${headingText || "<no heading>"}'`);

        // Loosened check: include tables if caption or heading includes 'passenger' OR 'destination'
        if (!captionText.includes("passenger") && !headingText.includes("passenger") && !captionText.includes("destination") && !headingText.includes("destination")) {
            console.log("  Skipping table - no 'Passenger' or 'Destination' found in caption or heading");
            return;
        }

        const rows = table.querySelectorAll("tr");
        rows.forEach((row, idxRow) => {
            if (idxRow === 0) return; // Skip header row

            const cols = row.querySelectorAll("td");
            if (cols.length < 2) return;

            const airline = cols[0].textContent.trim();
            if (!airline || airline.length < 2) return;

            let destText = cols[1].textContent || "";

            // Cleanup: remove footnotes, parentheticals, normalize dashes, collapse whitespace
            destText = destText
                .replace(/\[\d+\]/g, '')             // remove [1], [2], etc.
                .replace(/\([^)]+\)/g, '')           // remove (notes)
                .replace(/–/g, '-')                  // normalize dashes
                .replace(/\s{2,}/g, ' ')             // collapse whitespace
                .trim();

            console.log(`  Airline '${airline}', raw destinations text: '${destText}'`);

            const dests = destText
                .split(/[\n,;·•]/)
                .map(d => d.trim())
                .filter(d =>
                    d.length >= 3 &&
                    d.length < 50 &&
                    !/^\d+$/.test(d) &&               // exclude pure numbers
                    !/[0-9]{3,}/.test(d) &&           // exclude long numeric fragments
                    !/^\d{2,}[a-z]?$/i.test(d) &&     // exclude "267", "21A"
                    !/^(and|or|also|via|seasonal|charter|cargo|freight|terminated|suspended)$/i.test(d)
                );

            console.log(`  Filtered destinations for '${airline}': [${dests.join(", ")}]`);

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

    return airlineMap;
}

async function fetchDestinations(url) {
    const proxies = [
        { url: "/api/proxy?url=", isJson: false },  // your own deployed proxy endpoint
        { url: "https://api.allorigins.win/get?url=", isJson: true },
        { url: "https://corsproxy.io/?", isJson: false },
        { url: "https://api.codetabs.com/v1/proxy?quest=", isJson: false },
        { url: "https://thingproxy.freeboard.io/fetch/", isJson: false }
    ];

    let lastError = null;

    for (const proxy of proxies) {
        try {
            const proxyUrl = proxy.url + encodeURIComponent(url);
            console.log(`Trying proxy: ${proxyUrl}`);
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
            if (parsed.size > 0) {
                console.log(`Successfully parsed destination data from proxy: ${proxy.url}`);
                return parsed;
            } else {
                throw new Error('No destination data found in page');
            }

        } catch (err) {
            console.warn(`Proxy failed (${proxy.url}):`, err.message);
            lastError = err;
        }
    }

    throw new Error(`All proxies failed. Last error: ${lastError?.message || 'Unknown error'}`);
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

    return result.sort((a, b) => {
        if (a.airline === "All Airlines") return -1;
        if (b.airline === "All Airlines") return 1;
        return a.airline.localeCompare(b.airline);
    });
}

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

    // Show loading state
    output.innerHTML = '<div class="loading">Searching for Wikipedia pages...</div>';
    button.disabled = true;

    try {
        // Get Wikipedia URLs
        const [url1, url2] = await Promise.all([
            getWikipediaUrl(code1),
            getWikipediaUrl(code2)
        ]);

        output.innerHTML = '<div class="loading">Fetching destination data...</div>';

        // Fetch destination data
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

        // Display results
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
        output.innerHTML = `<div class="error">Error: ${err.message}</div>`;
    } finally {
        button.disabled = false;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add Enter key support
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                compareDestinations();
            }
        });
    });
});
