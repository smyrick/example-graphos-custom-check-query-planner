export const CHECK_CONFIG_OPTIONS = {
  // Difference in milliseconds where we log for the custom check
  timeDelta: {
    ruleName: 'CUSTOM_CHECK_QUERY_PLAN_TIME_DELTA',
    warning: 1,
    error: 1000
  },
  // The number of query plans diffs where we log for the custom check
  numberOfDifferences: {
    ruleName: 'CUSTOM_CHECK_QUERY_PLAN_NUM_DIFFS',
    warning: 1,
    error: 2
  },
};
