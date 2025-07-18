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

function parseHtml(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const tables = doc.querySelectorAll("table.wikitable");

    const airlineMap = new Map();
    const allDests = new Set();

    tables.forEach(table => {
        // Check table caption text for "Passenger"
        const caption = table.querySelector("caption");
        const captionText = caption ? caption.textContent.toLowerCase() : "";

        // If caption doesn't mention "passenger", check for preceding heading
        if (!captionText.includes("passenger")) {
            if (!caption && !hasPassengerHeading(table)) return;
            if (caption && !captionText.includes("passenger")) return;
        }

        const rows = table.querySelectorAll("tr");
        rows.forEach((row, idx) => {
            if (idx === 0) return; // Skip header row
            const cols = row.querySelectorAll("td");
            if (cols.length < 2) return;

            const airline = cols[0].textContent.trim();
            if (!airline || airline.length < 2) return;

            let destText = cols[1].textContent;

            // Remove ALL bracketed citations and references
            destText = destText.replace(/\s*\[\d+\]\s*/g, ', ');
            destText = destText.replace(/\s*\([^)]*\)\s*/g, ' ');

            const dests = destText
                .split(/\n|,|;|·|•/)
                .map(d => d.trim())
                .filter(d => d && d.length > 1 && d.length < 50)
                .filter(d => !d.match(/^(and|or|also|via|seasonal|charter|cargo|freight|terminated|suspended)$/i));

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

// Helper: check if a previous sibling heading contains "Passenger"
function hasPassengerHeading(table) {
    let el = table.previousElementSibling;
    let checkCount = 0;
    
    while (el && checkCount < 5) { // Limit search to avoid infinite loops
        if (/^h[1-6]$/i.test(el.tagName)) {
            if (el.textContent.toLowerCase().includes("passenger")) return true;
            else return false;
        }
        el = el.previousElementSibling;
        checkCount++;
    }
    return false;
}

async function fetchDestinations(url) {
    const proxies = [
        { url: "https://api.allorigins.win/get?url=", isJson: true },
        { url: "https://corsproxy.io/?", isJson: false },
        { url: "https://api.codetabs.com/v1/proxy?quest=", isJson: false },
        { url: "https://thingproxy.freeboard.io/fetch/", isJson: false }
    ];

    let lastError = null;
    
    for (const proxy of proxies) {
        try {
            const fetchUrl = proxy.url + encodeURIComponent(url);
            const response = await fetch(fetchUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            let html;
            if (proxy.isJson) {
                const json = await response.json();
                html = json.contents;
            } else {
                html = await response.text();
            }

            if (!html || html.length < 100) {
                throw new Error('Empty or invalid response');
            }

            const result = parseHtml(html);
            if (result.size > 0) {
                return result;
            } else {
                throw new Error('No destination data found in page');
            }

        } catch (err) {
            console.warn(`Proxy failed: ${proxy.url}`, err);
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
