import type { VercelRequest, VercelResponse } from '@vercel/node'
import { fetchOneSchema } from './_graphos-client';
import { GraphOSRequest } from './_graphos-types';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import { getQueryPlans } from './_query-planner';

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

    // Check secret signature, may throw an error
    //validateHmacSignature(req, payload);

    if (isGraphOSCustomCheckRequest(payload)) {
      console.log("Received GraphOS custom check:", payload.eventId, payload.eventType);

      const baseSupergraph = await fetchOneSchema(payload.checkStep.graphId, payload.baseSchema.hash);
      const baseSupergraphSdl = baseSupergraph?.data?.graph?.doc?.source;
      
      const proposedSupergraph = await fetchOneSchema(payload.checkStep.graphId, payload.proposedSchema.hash);
      const proposedSupergraphSdl = proposedSupergraph?.data?.graph?.doc?.source;

      const operationList = JSON.parse(await fs.readFile(process.cwd() + "/api/_operations.json", "utf-8"));
      const operations = operationList.operations.map(it => it.body);
      
      const oldPlans = getQueryPlans(baseSupergraphSdl, operations);
      const newPlans = getQueryPlans(proposedSupergraphSdl, operations);

      console.log(oldPlans);
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

  // To do HMAC you encode the request body text with the secret
  const stringPayload = JSON.stringify(payload);
  hmac.update(stringPayload);

  // Parsing Vercel headers does not return array if only 1 header value
  const providedSignature = req.headers['x-apollo-signature'] || '';
  const calculatedSignature = `sha256=${hmac.digest('hex')}`;

  if (providedSignature !== calculatedSignature) {
    throw new Error("Invalid HMAC signature");
  } else {
    console.info('HMAC verified. Continuing with custom check.');
  }
}
