export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle multipart uploads
  },
}

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
      "content-length",
    ];

    headersToForward.forEach((headerName) => {
      if (req.headers[headerName]) {
        forwardedHeaders[headerName] = req.headers[headerName];
      }
    });

    // Check if this is a multipart request (file upload)
    const isMultipart = req.headers["content-type"]?.includes("multipart/form-data");
    
    let body = undefined;
    
    if (req.method === "POST") {
      if (isMultipart) {
        // For multipart requests, stream the raw body directly
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        body = Buffer.concat(chunks);
      } else {
        // For regular JSON requests, read and parse the body
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const rawBody = Buffer.concat(chunks).toString();
        
        try {
          // Try to parse as JSON
          const parsedBody = JSON.parse(rawBody);
          body = JSON.stringify(parsedBody);
        } catch {
          // If not JSON, use raw body
          body = rawBody;
        }
        
        // Ensure Content-Type is set for GraphQL
        if (!forwardedHeaders["content-type"]) {
          forwardedHeaders["content-type"] = "application/json";
        }
      }
    }

    const response = await fetch(API_URL, {
      method: req.method,
      headers: forwardedHeaders,
      body,
    });

    // Handle both JSON and non-JSON responses
    let data;
    const contentType = response.headers.get("content-type");
    
    if (contentType?.includes("application/json")) {
      data = await response.json();
      res.setHeader("Content-Type", "application/json");
      return res.status(response.status).json(data);
    } else {
      // For non-JSON responses, stream the response
      const buffer = await response.arrayBuffer();
      
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
      
      return res.status(response.status).send(Buffer.from(buffer));
    }

  } catch (error) {
    console.error("Proxy error:", error);
    return res.status(500).json({
      errors: [{ message: "Internal server error", details: error.message }],
    });
  }
}