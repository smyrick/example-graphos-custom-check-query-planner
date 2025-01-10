import { QueryPlanner, serializeQueryPlan } from "@apollo/query-planner";
import { Operation, Supergraph, operationFromDocument } from "@apollo/federation-internals";
import { parse } from "graphql";

export function getQueryPlans(supergraphSdl: string, operationDocs: string[]) {
    const { supergraph, planner } = createQueryPlanner(supergraphSdl);

    return operationDocs
      .map(it => parseOperation(supergraph.apiSchema(), it))
      .map(it => getPlanText(planner, it));
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
    console.error("Error building supergraph");
    throw cause;
  }
}

function parseOperation(apiSchema, operationDoc: string) {
  try {
    return operationFromDocument(apiSchema, parse(operationDoc));
  } catch (cause) {
    console.error("Invalid operation:", operationDoc);
    throw cause;
  }
}

function getPlanText(planner: QueryPlanner, supergraphOperation: Operation) {
  try {
    return serializeQueryPlan(planner.buildQueryPlan(supergraphOperation));
  } catch (cause) {
    console.error("Could not generate plan for operation:", supergraphOperation.toString());
    throw cause;
  }
}
