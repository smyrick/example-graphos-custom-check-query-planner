import { diffLinesRaw } from "jest-diff";
import { QueryPlanner, serializeQueryPlan } from '@apollo/query-planner';
import { Operation } from '@apollo/federation-internals';
import { performance } from 'perf_hooks';

export interface QueryPlanDiff {
  numDifferences: number;
  timeDifference: number;
  lines: number;
  diffsPerLine: any;
}

export function diffQueryPlans(
  plannerOne: QueryPlanner,
  operationOne: Operation,
  plannerTwo: QueryPlanner,
  operationTwo: Operation
): QueryPlanDiff {
  // Track the time to generate base plan
  const baseStartTime = performance.now();
  const basePlan = plannerOne.buildQueryPlan(operationOne);
  const baseEndTime = performance.now();
  const baseTimeToPlan = baseEndTime - baseStartTime;

  // Track the time to generate proposed plan
  const proposedStartTime = performance.now();
  const proposedPlan = plannerTwo.buildQueryPlan(operationTwo);
  const proposedEndTime = performance.now();
  const proposedTimeToPlan = proposedEndTime - proposedStartTime;

  // Get the differences in query plan text
  const basePlanText = serializeQueryPlan(basePlan);
  const proposedPlanText = serializeQueryPlan(proposedPlan);
  const diffsPerLine = diffLinesRaw(basePlanText.split('\n'), proposedPlanText.split('\n'));
  const lines = diffsPerLine.length;
  const numDifferences = diffsPerLine.filter(it => it[0] !== 0).length;

  return {
    timeDifference: proposedTimeToPlan - baseTimeToPlan,
    lines,
    numDifferences,
    diffsPerLine
  };
}
