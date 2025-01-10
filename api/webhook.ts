import type { VercelRequest, VercelResponse } from '@vercel/node'
import { GraphOSRequest } from './_graphos-types';
import * as crypto from 'crypto';

const APOLLO_HMAC_SECRET = process.env['APOLLO_HMAC_SECRET'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    // Process the webhook payload
    const payload = req.body || {};

    // Do something with the payload
    console.log("Webhook received:", payload);

    // May throw an error
    validateHmacSignature(req, payload);

    if (isGraphOSCustomCheckRequest(payload)) {
      console.log("Received GraphOS custom check:", payload.eventId, payload.eventType);
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

function validateHmacSignature(req: VercelRequest, payload: object) {
  if (!APOLLO_HMAC_SECRET) {
    throw new Error("HMAC secret not setup in environment");
  }

  // Include the webhook request in the calculated HMAC signature
  const hmac = crypto.createHmac('sha256', APOLLO_HMAC_SECRET);
  const stringPayload = JSON.stringify(payload);
  console.log('String Payload:', stringPayload);
  hmac.update(stringPayload);

  const sigHeader = req.headers['x-apollo-signature'] || [];
  console.log('Header:', sigHeader);
  const providedSignature = sigHeader[0];
  const calculatedSignature = `sha256=${hmac.digest('hex')}`;

  if (providedSignature !== calculatedSignature) {
    console.log("Provided Signature:", providedSignature);
    console.log("Calculated Signature:", calculatedSignature);
    throw new Error("Invalid HMAC signature");
  }
}
