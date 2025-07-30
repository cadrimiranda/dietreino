export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, apollo-require-preflight, x-apollo-operation-name, apollo-query-plan-experimental"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const API_URL = "http://168.138.158.94:8080/graphql";

  try {
    // Forward all relevant headers from the original request
    const forwardedHeaders = {};

    // Copy important headers
    const headersToForward = [
      "content-type",
      "authorization",
      "apollo-require-preflight",
      "x-apollo-operation-name",
      "apollo-query-plan-experimental",
      "user-agent",
      "accept",
      "accept-encoding",
      "accept-language",
    ];

    headersToForward.forEach((headerName) => {
      if (req.headers[headerName]) {
        forwardedHeaders[headerName] = req.headers[headerName];
      }
    });

    // Ensure Content-Type is set for GraphQL
    if (!forwardedHeaders["content-type"]) {
      forwardedHeaders["content-type"] = "application/json";
    }

    // Prepare the body
    let body = undefined;
    if (req.method === "POST" && req.body) {
      // If body is already parsed as object, stringify it
      body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(API_URL, {
      method: req.method,
      headers: forwardedHeaders,
      body,
    });

    const data = await response.json();

    // Forward response headers
    response.headers.forEach((value, key) => {
      // Skip headers that might cause issues
      if (
        !["content-encoding", "content-length", "transfer-encoding"].includes(
          key.toLowerCase()
        )
      ) {
        res.setHeader(key, value);
      }
    });

    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return res.status(500).json({
      errors: [{ message: "Internal server error", details: error.message }],
    });
  }
}
