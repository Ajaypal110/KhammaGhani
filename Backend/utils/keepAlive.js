import https from "https";

/**
 * Pings the server every 5 minutes to keep it alive on Render's free tier.
 * @param {string} url - The URL to ping.
 */
const keepAlive = (url) => {
  if (!url) {
    console.warn("Keep-alive skipped: No URL provided.");
    return;
  }

  console.log(`Keep-alive interval started for: ${url}`);
  
  // Ping every 5 minutes (300,000 ms)
  setInterval(() => {
    https.get(url, (res) => {
      console.log(`[Keep-Alive] Pinged server at ${new Date().toISOString()}. Status: ${res.statusCode}`);
    }).on("error", (err) => {
      console.error(`[Keep-Alive] Ping error: ${err.message}`);
    });
  }, 300000); // 300000ms = 5 minutes
};

export default keepAlive;
