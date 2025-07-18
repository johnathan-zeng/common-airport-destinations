async function getWikipediaUrl(code) {
    const queries = [`airport ${code}`, `airport ${code}`]; // Using both queries for fallback
    for (const query of queries) {
        const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
        try {
            console.log(`[getWikipediaUrl] Searching Wikipedia for query: "${query}"`);
            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error(`Wikipedia API error: ${res.status}`);
            const json = await res.json();
            const firstResult = json.query?.search?.[0];
            if (firstResult) {
                const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(firstResult.title)}`;
                console.log(`[getWikipediaUrl] Found Wikipedia page: ${url}`);
                return url;
            } else {
                console.log(`[getWikipediaUrl] No results for query: "${query}"`);
            }
        } catch (err) {
            console.warn(`[getWikipediaUrl] Failed for query "${query}": ${err.message}`);
        }
    }
    throw new Error(`No Wikipedia page found for airport code: ${code}`);
}

async function fetchDestinations(url) {
    const proxies = [
        { url: "/api/proxy?url=", isJson: false }
        // Add other proxies if needed
    ];
    let lastError = null;

    for (const proxy of proxies) {
        try {
            const proxyUrl = proxy.url + encodeURIComponent(url);
            console.log(`[fetchDestinations] Fetching via proxy: ${proxyUrl}`);
            const res = await fetch(proxyUrl);
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

            let html;
            if (proxy.isJson) {
                const json = await res.json();
                html = json.contents;
            } else {
                html = await res.text();
            }
            console.log(`[fetchDestinations] Received HTML length: ${html.length}`);

            if (!html || html.length < 100) throw new Error('Empty or invalid response');

            const parsed = parseHtml(html);
            console.log(`[fetchDestinations] Parsed destinations, airlines found: ${parsed.size}`);

            if (parsed.size > 0) return parsed;
            else throw new Error('No destination data found in page');

        } catch (err) {
            console.warn(`[fetchDestinations] Proxy failed (${proxy.url}): ${err.message}`);
            lastError = err;
        }
    }

    throw new Error(`All proxies failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

async function compareDestinations() {
    const code1 = document.getElementById("code1").value.trim().toUpperCase();
    const code2 = document.getElementById("code2").value.trim().toUpperCase();
    const output = document.getElementById("output");
    const button = document.querySelector("button");

    console.log(`[compareDestinations] Comparing airports: ${code1} vs ${code2}`);

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
        console.error('[compareDestinations] Error:', err);
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
