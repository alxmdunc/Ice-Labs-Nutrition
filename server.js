const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function send(res, statusCode, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(statusCode, {
    "Content-Type": contentType,
    "Cache-Control": contentType.startsWith("text/html") ? "no-cache" : "public, max-age=3600"
  });
  res.end(body);
}

function serveStatic(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const safePath = path.normalize(decodeURIComponent(requestUrl.pathname)).replace(/^(\.\.[/\\])+/, "");
  let filePath = path.join(PUBLIC_DIR, safePath);

  if (requestUrl.pathname === "/" || requestUrl.pathname === "/where-to-buy") {
    filePath = path.join(PUBLIC_DIR, "index.html");
  }

  if (!filePath.startsWith(PUBLIC_DIR)) {
    send(res, 403, "Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        fs.readFile(path.join(PUBLIC_DIR, "index.html"), (fallbackErr, fallback) => {
          if (fallbackErr) send(res, 404, "Not found");
          else send(res, 200, fallback, mimeTypes[".html"]);
        });
        return;
      }

      send(res, 500, "Server error");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    send(res, 200, data, mimeTypes[ext] || "application/octet-stream");
  });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/contact") {
    try {
      const rawBody = await parseBody(req);
      const data = JSON.parse(rawBody || "{}");

      if (!data.email || !String(data.email).includes("@")) {
        send(res, 400, JSON.stringify({ ok: false, message: "Please include a valid email." }), mimeTypes[".json"]);
        return;
      }

      const submittedAt = new Date().toISOString();
      const lead = { submittedAt, ...data };
      console.log("Wholesale/contact lead:", JSON.stringify(lead));

      send(res, 200, JSON.stringify({ ok: true, message: "Thanks. We will reach out shortly." }), mimeTypes[".json"]);
    } catch (error) {
      send(res, 500, JSON.stringify({ ok: false, message: "Unable to send your message right now." }), mimeTypes[".json"]);
    }
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    send(res, 405, "Method not allowed");
    return;
  }

  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Ice Labs Nutrition site running at http://localhost:${PORT}`);
});
