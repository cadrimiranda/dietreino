export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, apollo-require-preflight"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const API_URL = "http://168.138.158.94:8080/graphql";

  try {
    const headers = {
      "Content-Type": "application/json",
      "apollo-require-preflight": "true",
    };

    if (req.headers.authorization) {
      headers.authorization = req.headers.authorization;
    }

    const response = await fetch(API_URL, {
      method: req.method,
      headers,
      body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();

    res.setHeader("Content-Type", "application/json");
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return res.status(500).json({
      errors: [{ message: "Internal server error" }],
    });
  }
}
