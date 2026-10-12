const express = require("express");
const app = express();

app.use(express.static("public"));

app.get("/api/fetch", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({
      error: "Please enter a website URL."
    });
  }

  let target;

  try {
    target = new URL(url);
  } catch {
    return res.status(400).json({
      error: "Invalid URL."
    });
  }

  if (
    target.protocol !== "https:" ||
    target.hostname === "localhost" ||
    !target.hostname.includes(".")
  ) {
    return res.status(400).json({
      error: "Only public HTTPS websites are supported."
    });
  }

  try {
    const response = await fetch(target.href, {
      signal: AbortSignal.timeout(8000),
      headers: {
        Accept: "text/plain,text/html"
      }
    });

    const type = response.headers.get("content-type") || "";

    if (!response.ok || !type.includes("text/html")) {
      return res.status(502).json({
        error: "This website could not be displayed."
      });
    }

    const html = await response.text();

    res.type("text/plain").send(html.slice(0, 100000));
  } catch {
    res.status(502).json({
      error: "Could not fetch this website."
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => {
  console.log(`7mody Proxy running on port ${port}`);
});
 


