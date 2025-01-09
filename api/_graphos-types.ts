// This is a manual file copied from the GraphOS docs
// https://www.apollographql.com/docs/graphos/platform/schema-management/checks/custom

export interface GitContext {
  branch?: string;
  commit?: string;
  committer?: string;
  message?: string;
  remoteUrl?: string;
}

export interface CheckStep {
  graphId: string;
  graphVariant: string;
  taskId: string;
  workflowId: string;
  gitContext: GitContext;
}

export interface SubgraphInfo {
  hash: string;
  name: string;
}

export interface SchemaInfo {
  hash: string;
  subgraphs: SubgraphInfo[];
}

export interface GraphOSRequest {
  eventType: 'APOLLO_CUSTOM_CHECK';
  eventID: string;
  version: string;
  checkStep: CheckStep;
  baseSchema: SchemaInfo;
  proposedSchema: SchemaInfo;
}
