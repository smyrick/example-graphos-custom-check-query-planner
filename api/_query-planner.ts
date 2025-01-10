import { QueryPlanner, QueryPlan, serializeQueryPlan } from "@apollo/query-planner";
import { Supergraph, operationFromDocument } from "@apollo/federation-internals";
import { parse } from "graphql";

export function getQueryPlans(supergraphSdl: string, operationDocs: string[]) {
    const { supergraph, planner } = createQueryPlanner(supergraphSdl);

    try {
      return operationDocs
        .map(it => parse(it))
        .map(it => operationFromDocument(supergraph.apiSchema(), it))
        .map(it => planner.buildQueryPlan(it))
        .map(it => serializeQueryPlan(it));
    } catch (cause) {
      throw new Error("Error generating query plan for operation", { cause });
    }
};

function createQueryPlanner(supergraphSdl) {
  try {
    const supergraph = Supergraph.build(supergraphSdl, { validateSupergraph: true });
    const planner = new QueryPlanner(supergraph);

    return {
      supergraph,
      planner
    }
  } catch (cause) {
    throw new Error("Error building supergraph", { cause });
  }
}
