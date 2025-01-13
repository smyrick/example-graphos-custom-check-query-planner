import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';
import {
  CustomCheckViolation,
  fetchOneSchema,
  sendCustomCheckResponse
} from './_graphos-client';
import { GraphOSRequest } from './_graphos-types';
import { comparePlans } from './_query-planner';
import { OPERATIONS } from './_operations';
import { CHECK_CONFIG_OPTIONS } from './_config-options';

const APOLLO_HMAC_SECRET = process.env['APOLLO_HMAC_SECRET'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    // Process the webhook payload
    const payload = req.body || {};
    console.log("Webhook received:", JSON.stringify(payload));

    // Check secret signature, may throw an error
    validateHmacSignature(req, payload);

    if (isGraphOSCustomCheckRequest(payload)) {
      await processCheck(payload);

      res.status(200).json({ message: "Webhook processed successfully!" });
    } else {
      console.error("Invalid webhook request");
      res
        .status(400)
        .json({ error: "The request was not a valid custom check request from GraphOS" });
    }
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

async function processCheck(payload: GraphOSRequest) {
  const graphId = payload.checkStep.graphId;
  const baseSupergraph = await fetchOneSchema(graphId, payload.baseSchema.hash);
  const baseSupergraphSdl = baseSupergraph?.data?.graph?.doc?.source;

  const proposedSupergraph = await fetchOneSchema(graphId, payload.proposedSchema.hash);
  const proposedSupergraphSdl = proposedSupergraph?.data?.graph?.doc?.source;

  if (!baseSupergraphSdl || !proposedSupergraphSdl) {
    throw new Error("Failed to fetch valid supergraphs for the custom check");
  }

  console.info("Successfully fetched the supergraphs to check");

  const diffs = comparePlans(baseSupergraphSdl, proposedSupergraphSdl, OPERATIONS);

  console.info("Generated diffs in query plans");

  let totalDiffs = 0;
  let violations: CustomCheckViolation[] = [];

  diffs.forEach((diff, index) => {
    totalDiffs += diff.numDifferences;

    // Check the number of text plan differences
    if (diff.numDifferences >= CHECK_CONFIG_OPTIONS.numberOfDifferences.error) {
      violations.push({
        level: 'ERROR',
        rule: CHECK_CONFIG_OPTIONS.numberOfDifferences.ruleName,
        message: `There were ${diff.numDifferences} differences for the custom check operation ${index}`
      });
    } else if (diff.numDifferences >= CHECK_CONFIG_OPTIONS.numberOfDifferences.warning) {
      violations.push({
        level: 'WARNING',
        rule: CHECK_CONFIG_OPTIONS.numberOfDifferences.ruleName,
        message: `There were ${diff.numDifferences} differences for the custom check operation ${index}`
      });
    }

    // Check the time delta differences
    if (Math.abs(diff.timeDifference) >= CHECK_CONFIG_OPTIONS.timeDelta.error) {
      violations.push({
        level: 'ERROR',
        rule: CHECK_CONFIG_OPTIONS.timeDelta.ruleName,
        message: `There was a time delta of ${diff.timeDifference} for the custom check operation ${index}`
      });
    } else if (Math.abs(diff.timeDifference) >= CHECK_CONFIG_OPTIONS.timeDelta.warning) {
      violations.push({
        level: 'WARNING',
        rule: CHECK_CONFIG_OPTIONS.timeDelta.ruleName,
        message: `There was a time delta of ${diff.timeDifference} for the custom check operation ${index}`
      });
    }
  });

  if (totalDiffs > 0) {
    violations.push({
      level: 'INFO',
      rule: CHECK_CONFIG_OPTIONS.numberOfDifferences.ruleName,
      message: `There were ${totalDiffs} total differences in query plans across all operations`
    });
  }

  const numErrors = violations.filter(it => it.level === "ERROR").length;
  const numWarns = violations.filter(it => it.level === "WARNING").length;
  const numInfo = violations.filter(it => it.level === "INFO").length;

  await sendCustomCheckResponse({
    graphId: payload.checkStep.graphId,
    graphVariant: payload.checkStep.graphVariant,
    taskId: payload.checkStep.taskId,
    workflowId: payload.checkStep.workflowId,
    result: {
      status: numErrors > 0 ? 'FAILURE' : 'SUCCESS',
      violations
    }
  });

  console.info(`Successfully updated GraphOS check with ${numErrors} errors, ${numWarns} warnings, and ${numInfo} info violations`);
}
