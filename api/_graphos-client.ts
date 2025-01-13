import { Client, gql, fetchExchange } from "@urql/core";

const graphOSClient = new Client({
  url: 'https://api.apollographql.com/api/graphql',
  exchanges: [fetchExchange],
  fetchOptions: () => {
    return {
      headers: {
        'Content-Type': 'application/json',
        'apollographql-client-name': 'example-graphos-custom-check-query-planner',
        'apollographql-client-version': '0.0.1',
        'x-api-key': process.env['APOLLO_API_KEY'],
      }
    }
  }
});

const customCheckCallbackMutation = gql`
  mutation CustomCheckCallback(
    $input: CustomCheckCallbackInput!
    $name: String!
    $graphId: ID!
  ) {
    graph(id: $graphId) {
      variant(name: $name) {
        customCheckCallback(input: $input) {
          __typename
          ... on CustomCheckResult {
            violations {
              level
              message
              rule
            }
          }
          ... on PermissionError {
            message
          }
          ... on TaskError {
            message
          }
          ... on ValidationError {
            message
          }
        }
      }
    }
  }
`;

const fetchOneSchemaQuery = gql`
  query FetchOneSchema($graphId: ID!, $hash: SHA256) {
    graph(id: $graphId) {
      doc(hash: $hash) {
        source
      }
    }
  }
`;

const fetchSchemasQuery = gql`
  query FetchSchemas($graphId: ID!, $hashes: [SHA256!]!) {
    graph(id: $graphId) {
      docs(hashes: $hashes) {
        hash
        source
      }
    }
  }
`;

export const fetchOneSchema = async (graphId: string, hash: string) => {
  return await graphOSClient
    .query(fetchOneSchemaQuery, { graphId: graphId, hash: hash })
    .toPromise()
    .catch((err) => {
      console.error(err);
      return { data: { graph: null } };
    });
};

export const fetchSchemas = async (graphId: string, hashes: string[]) => {
  return await graphOSClient
    .query(fetchSchemasQuery, { graphId: graphId, hashes: hashes })
    .toPromise()
    .catch((err) => {
      console.error(err);
      return { data: { graph: null } };
    });
};

export interface CustomCheckViolation {
  level: 'ERROR' | 'WARNING' | 'INFO';
  message: string;
  rule: string;
}

export interface CustomCheckCallbackResultInput {
  status: 'SUCCESS' | 'FAILURE';
  violations: CustomCheckViolation[];
}

export interface CustomCheckCallbackInput {
  graphId: string;
  graphVariant: string;
  taskId: string;
  workflowId: string;
  result: CustomCheckCallbackResultInput;
}

export const sendCustomCheckResponse = async (input: CustomCheckCallbackInput) => {
  return graphOSClient.mutation(
    customCheckCallbackMutation,
    {
      graphId: input.graphId,
      name: input.graphVariant,
      input: {
        taskId: input.taskId,
        workflowId: input.workflowId,
        status: input.result.status,
        violations: input.result.violations,
      },
    }).toPromise();
};
