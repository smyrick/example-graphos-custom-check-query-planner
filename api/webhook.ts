import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    // Process the webhook payload
    const payload = req.body; // Assuming the payload is in the request body

    // Do something with the payload
    console.log("Webhook received:", payload);

    // Return a response (optional)
    res.status(200).json({ message: "Webhook received successfully!" });
  } catch (error) {
    console.error("Webhook error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the webhook." });
  }
}
