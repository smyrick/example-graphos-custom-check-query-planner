# GraphOS Webhook Listener

Example code that listens to a GraphOS webhook notification

The code in this repository is experimental and has been provided for reference purposes only. Community feedback is welcome but this project may not be supported in the same way that repositories in the official Apollo GraphQL GitHub organization are. If you need help you can file an issue on this repository, contact Apollo to talk to an expert, or create a ticket directly in Apollo Studio.

## How to Use

You can choose from one of the following two methods to use this repository:

### One-Click Deploy

Deploy the example using [Vercel](https://vercel.com?utm_source=github&utm_medium=readme&utm_campaign=vercel-examples):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/vercel/examples/tree/main/solutions/node-hello-world&project-name=node-hello-world&repository-name=node-hello-world)

### Clone and Deploy

```bash
git clone https://github.com/vercel/examples/tree/main/solutions/node-hello-world
```

Install the Vercel CLI:

```bash
npm run vercel
```

## Endpoints

- `/api/hello` Simple test endpoint that returns a hello world message
- `/api/webhook` Example Webhook that understands [GraphOS Notifications](https://www.apollographql.com/docs/graphos/platform/insights/notifications/schema-changes)
