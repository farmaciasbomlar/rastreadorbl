import express from "express";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Proxy endpoint to handle cross-origin requests
  app.get("/api/proxy", async (req, res) => {
    try {
        const targetUrl = req.query.url as string;
        
        if (!targetUrl) {
            return res.status(400).json({ error: "Missing 'url' query parameter" });
        }

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'Connection': 'keep-alive'
        };

        const response = await fetch(targetUrl, { headers });
        
        if (!response.ok) {
            console.error(`Proxy request failed for ${targetUrl} with status: ${response.status}`);
            return res.status(response.status).json({ error: `Proxy request failed with status: ${response.status}` });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Proxy error:", error);
        res.status(500).json({ error: "Internal Server Error in Proxy" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
