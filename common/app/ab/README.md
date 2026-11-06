# Server-side AB tests in Frontend

Server-side AB tests are defined in `dotcom-rendering-main/ab-testing/config/abTests.ts` and deployed to Fastly. Fastly
assigns each participating request to a group and sends the result to Frontend in the `X-GU-Server-AB-Tests` header.

`ABTestingFilter` decorates the Play request with those participations. Feature-specific server code should expose a
small helper built on `ABTests.isUserInTestGroup`, rather than defining a duplicate experiment or switch in Frontend.

The `enable-new-server-side-tests-header` infrastructure switch must be enabled in each environment where these tests
are expected to run.
