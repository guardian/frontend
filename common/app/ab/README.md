# Server-side AB tests in Frontend

Server-side AB tests are defined in `dotcom-rendering-main/ab-testing/config/abTests.ts` and deployed to Fastly. Fastly
assigns each participating request to a group and sends the result to Frontend in the X-GU-Server-AB-Tests header.

ABTestingFilter decorates the Play request with those participations. Feature-specific server code should expose a
small helper built on ABTests.isUserInTestGroup, rather than defining a duplicate experiment or switch in Frontend.

The enable-new-server-side-tests-header infrastructure switch must be enabled in each environment where these tests
are expected to run.

## Puzzles hub

The puzzles hub uses the Fastly-managed puzzles-new-hub experiment. Frontend code should check
PuzzlesHubExperiment.isEnabled, which is true only for the variant group and safely defaults to false for control,
excluded, missing, or malformed participations.

The existing Fastly routes can be used to force a group in CODE or PROD:

-   /ab-tests/opt-in/puzzles-new-hub:variant
-   /ab-tests/opt-in/puzzles-new-hub:control
-   /ab-tests/opt-out

The /puzzles and /puzzles.json routes, as well as puzzles navigation, are available only to variant requests.
Development and QA can use the Fastly opt-in route above to force variant participation.
