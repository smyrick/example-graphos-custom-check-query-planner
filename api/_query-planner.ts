import { QueryPlanner } from "@apollo/query-planner";
import { Supergraph, operationFromDocument, Schema } from '@apollo/federation-internals';
import { parse } from "graphql";
import { diffQueryPlans, QueryPlanDiff } from './_diff-plans';

export function comparePlans(baseSupergraph: string, proposedSupergraph: string, operations: string[]): QueryPlanDiff[] {
  const basePlanner = createQueryPlanner(baseSupergraph);
  const proposedPlanner = createQueryPlanner(proposedSupergraph);
  const baseOperations = operations
    .map(it => parseOperation(basePlanner.supergraph.apiSchema(), it));
  const proposedOperations = operations
    .map(it => parseOperation(proposedPlanner.supergraph.apiSchema(), it));

  if (baseOperations.length !== proposedOperations.length) {
    console.error(`There was an operations mismatch between 
      supergraphs, base: ${baseOperations.length}, proposed: ${proposedOperations.length}`);
    throw new Error('Difference in generating operations for supergraphs');
  }

  let diffs = [];
  baseOperations.forEach((_, i) => {
    const baseOp = baseOperations[i];
    const proposedOp = proposedOperations[i];

    // Get the query plan diff object
    const diff = diffQueryPlans(basePlanner.planner, baseOp, proposedPlanner.planner, proposedOp);

    diffs.push(diff);
  });

  return diffs;
}

function createQueryPlanner(supergraphSdl: string) {
  try {
    const supergraph = Supergraph.build(supergraphSdl, { validateSupergraph: true });
    const planner = new QueryPlanner(supergraph);

    return {
      supergraph,
      planner
    }
  } catch (cause) {
    console.error("Error building supergraph");
    throw cause;
  }
}

function parseOperation(apiSchema: Schema, operationDoc: string) {
  try {
    return operationFromDocument(apiSchema, parse(operationDoc));
  } catch (cause) {
    console.error("Invalid operation:", operationDoc);
    throw cause;
  }
}
