# amphtml-validator

Utility that uses the amphtml-validator to validate AMP endpoints.

Mainly for running on teamcity, the [build steps](https://teamcity.gutools.co.uk/viewType.html?buildTypeId=dotcom_AmpValidation) do the following:

- `npm i` (where `cwd` is `tools/amp-validation`)
- `npm start` (where `cwd` is `tools/amp-validation`)

It has it's own npm modules.
