import http from 'http';

const API_KEY = process.env.INFRA_API_KEY || 'test-api-key';
const HOST = 'localhost';
const PORT = 8080;
const CONCURRENCY = 200;
const DURATION_SEC = 30;

function makeRequest(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: HOST,
            port: PORT,
            path: '/api' + path, // Gateway prefix check? Route says /functions, but app might mount routes at /api.
            method: method,
            headers: {
                'x-api-key': API_KEY,
                'Content-Type': 'application/json',
                'x-async': 'true' // Fire-and-Forget Mode
            }
        };

        // Note: Check if app.js mounts routes at / or /api. 
        // Assuming /api based on previous checks.

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        });

        req.on('error', (e) => reject(e));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

// Ensure /api prefix handling
async function checkApiPrefix() {
    try {
        await makeRequest('/health'); // Try /api/health
    } catch (e) {
        // Fallback?
    }
}

async function run() {
    console.log(`\x1b[36m⚡ Starting Load Test: ${CONCURRENCY} Virtual Users\x1b[0m`);

    // 1. Get Function
    console.log("🔍 Finding target function...");
    let functionId = null;
    let functionName = 'Unknown';

    try {
        const res = await makeRequest('/functions');
        if (res.status !== 200) {
            // Try without /api prefix if failed? 
            // For now assume /api is correct mount point.
            throw new Error(`Status ${res.status}`);
        }
        const funcs = JSON.parse(res.body);
        if (funcs.length > 0) {
            functionId = funcs[0].functionId;
            functionName = funcs[0].name;
            console.log(`✅ Target found: \x1b[33m${functionName}\x1b[0m (${functionId})`);
        } else {
            console.log("❌ No functions found. Please deploy a function first.");
            process.exit(1);
        }
    } catch (e) {
        console.log("❌ Failed to fetch functions: " + e.message);
        process.exit(1);
    }

    // 2. Hammer Time (Async Machine Gun)
    console.log(`🚀 Sending Async Traffic... (${CONCURRENCY} VU / ${DURATION_SEC}s)`);

    const startTime = Date.now();
    let requestsSent = 0;
    let successCount = 0;
    let failCount = 0;

    const displayInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const rps = (requestsSent / elapsed).toFixed(1);
        console.log(`[${elapsed.toFixed(1)}s] Requests: ${requestsSent} | \x1b[32mAccepted: ${successCount}\x1b[0m | Failed: ${failCount} | RPS: \x1b[36m${rps}\x1b[0m`);
    }, 500); // Faster updates

    const attackLoop = async () => {
        while ((Date.now() - startTime) < DURATION_SEC * 1000) {
            try {
                requestsSent++;
                // Async Request (Fire independent of response time)
                makeRequest('/run', 'POST', {
                    functionId: functionId,
                    inputData: { test: true }
                }).then(r => {
                    if (r.status === 200 || r.status === 202) successCount++;
                    else failCount++;
                }).catch(() => failCount++);

                // Pure Throughput Mode: minimal wait
                await new Promise(r => setTimeout(r, 10));
            } catch (e) {
                failCount++;
            }
        }
    };

    const workers = [];
    for (let i = 0; i < CONCURRENCY; i++) {
        workers.push(attackLoop());
    }

    await Promise.all(workers);
    clearInterval(displayInterval);

    console.log("\n=================================");
    console.log("\x1b[32m✅ Load Test Completed\x1b[0m");
    console.log(`Total Requests: ${requestsSent}`);
    console.log(`Success Rate: ${((successCount / requestsSent) * 100).toFixed(1)}%`);
    console.log("=================================");
}

run();
