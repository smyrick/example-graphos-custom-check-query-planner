# GraphOS Query Planner Custom Check

Example code that listens to a GraphOS custom check webhook to validate changes in query plans

![Screenshot 2025-01-13 at 1 28 38 PM](https://github.com/user-attachments/assets/fec5a78e-502c-48bf-ba54-3fd458d4ed07)


:warning:
This code uses the internal package of the JS Query Planner. Apollo is actively moving to a new [Native Query Planner](https://www.apollographql.com/docs/graphos/routing/query-planning/native-query-planner) and this may have to be updated in the future to support new Federation features

:warning:
The code in this repository is experimental and has been provided for reference purposes only. Community feedback is welcome but this project may not be supported in the same way that repositories in the official Apollo GraphQL GitHub organization are. If you need help you can file an issue on this repository, contact Apollo to talk to an expert, or create a ticket directly in Apollo Studio.

## What's Inside
The code that lives in `api/webhook.ts` is example Typescript code for a [Vercel Function](https://vercel.com/docs/functions) that can be called by GraphOS Studio when a custom check is triggered.
This is an example in Vercel, but you could apply this code or logic to any runtime, serverless or not, you just need a public endpoint for GraphOS to call.

Inside the function we validate that it is a proper check notification with HMAC and then fetch the current and proposed supergraphs to check the differences in query plans.

As an example you could change the level of warnings vs errors in the `_config-options.ts` file

### Run Locally

* Clone the repo
* Install the latest LTS version of Node (see [nvm](https://github.com/nvm-sh/nvm))
* Install dependencies
    ```bash
    npm install
    ```
* Start the app using the Vercel CLI locally:
    ```bash
    npm run vercel
    ```

## Endpoints

- `/api/hello` Simple test endpoint that returns a hello world message
- `/api/webhook` Example Webhook that understands [GraphOS Custom Checks](https://www.apollographql.com/docs/graphos/platform/schema-management/checks/custom)
