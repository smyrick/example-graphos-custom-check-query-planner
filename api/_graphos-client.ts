import { ApolloClient, gql, InMemoryCache } from '@apollo/client/core/core.cjs';

const graphOSClient = new ApolloClient({
  uri: process.env['APOLLO_STUDIO_URL'] ??'https://api.apollographql.com/api/graphql',
  cache: new InMemoryCache(),
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

const CLIENT_HEADERS = {
  'Content-Type': 'application/json',
  'apollographql-client-name': 'example-graphos-custom-check-query-planner',
  'apollographql-client-version': '0.0.1',
  'x-api-key': process.env['APOLLO_API_KEY'],
};

export const fetchSchemas = async (graphId: string, hashes: string[]) => {
  return await graphOSClient
    .query<{
      graph: null | {
        docs: null | Array<null | { hash: string; source: string }>;
      };
    }>({
      query: fetchSchemasQuery,
      variables: {
        graphId: graphId,
        hashes: hashes,
      },
      context: {
        headers: {
          ...CLIENT_HEADERS
        },
      },
    })
    .catch((err) => {
      console.error(err);
      return { data: { graph: null } };
    });
};

export interface CustomCheckCallbackInput {
  graphId: string;
  graphVariant: string;
  result: {
    taskId: string;
    workflowId: string;
    status: 'SUCCESS' | 'FAILURE';
  }
}

export const sendCustomCheckResponse = async (input: CustomCheckCallbackInput) => {
  const callbackResult = await graphOSClient.mutate({
    mutation: customCheckCallbackMutation,
    variables: {
      graphId: input.graphId,
      name: input.graphVariant,
      input: {
        taskId: input.result.taskId,
        workflowId: input.result.workflowId,
        status: input.result,
        violations: [],
      },
    },
    context: {
      headers: {
        ...CLIENT_HEADERS
      },
    },
  });

  console.log(
    JSON.stringify(`Callback results: ${JSON.stringify(callbackResult)}`),
  );

  return;
};
