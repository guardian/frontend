# Template tracker agent

## Context
Historically, the guardian's website was rendered using twirl templates hosted in this very repository.
A long migration was undertaken to move to more recent technologies (server side rendered react) in a [separate repository](https://github.com/guardian/dotcom-rendering/)

As of July 2026, the migration is coming to an end and we're in a situation where we don't have clear visibility as to what's still being used, and what's not.

## What this module does

The JVM comes with the ability to modify classes before they are being loaded with a mechanism called "instrumentation".
This module is a jvm instrumentation agent which makes use of this capability to detect each time one of these 490 twirl templates is being used in a given context.

Each novel use is logged to a file `twirl-usage.log`, which is then uploaded to S3 by fluent bit in order to be queryable through Athena.

## Why?

This gives us visibility into which part of our rendering code is still happening in this repo. We can then decide to keep, migrate or delete depending on each situation.

## We don't need it anymore, how do we delete it?

This feature was created with the following PRs:
- https://github.com/guardian/frontend/pull/28895
- https://github.com/guardian/platform/pull/2284
- https://github.com/guardian/platform/pull/2289
- https://github.com/guardian/frontend/pull/28937
- https://github.com/guardian/platform/pull/2293
- https://github.com/guardian/frontend/pull/28968

To completely remove these capabilities you'll need to:
- A first `frontend` PR that:
  - deletes the `template-tracker-agent` directory at the root of this repo
  - deletes the `templateTrackerAgent` module in sbt, and associated variables, as well as the `withTwirlInstrumentation` variables and all of its usages
- A second `platform` PR that:
  - Removes the custom fluent-bit configuration [introduced here](https://github.com/guardian/platform/pull/2289/changes#diff-18bd302d25fb5e54cb207c132df35e930d96714eeafdaa44508d15135a5f9e10)
