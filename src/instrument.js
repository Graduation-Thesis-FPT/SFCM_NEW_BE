// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
// import * as Sentry from '@sentry/node';
// import { nodeProfilingIntegration } from '@sentry/profiling';
const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');
Sentry.init({
  dsn: 'https://018bba86cfd699117bebef7c3c45e714@o4507623556907008.ingest.us.sentry.io/4507623560708096',
  integrations: [
    // Add our Profiling integration
    nodeProfilingIntegration(),
  ],

  // Add Tracing by setting tracesSampleRate
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // Set sampling rate for profiling
  // This is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});
