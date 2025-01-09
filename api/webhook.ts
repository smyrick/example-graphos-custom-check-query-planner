import type { VercelRequest, VercelResponse } from '@vercel/node'
import { GraphOSRequest } from './_graphos-types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    // Process the webhook payload
    const payload = req.body; // Assuming the payload is in the request body

    // Do something with the payload
    console.log("Webhook received:", payload);

    if (isGraphOSCustomCheckRequest(payload)) {
      console.log("Received GraphOS custom check:", payload.eventID, payload.eventType);
    }

    // Return a response (process custom check in background)
    res.status(200).json({ message: "Webhook received successfully!" });
  } catch (error) {
    console.error("Webhook error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the webhook." });
  }
}

function isGraphOSCustomCheckRequest(payload: any): payload is GraphOSRequest {
  return payload.eventType === "APOLLO_CUSTOM_CHECK";
}
