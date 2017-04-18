# amphtml-validator

Utility that uses the amphtml-validator to validate AMP endpoints.

Mainly for running on teamcity, the [build steps](https://teamcity.gu-web.net/admin/editBuildRunners.html?id=buildType:dotcom_AmpValidation) do the following:

- `npm i` (where `cwd` is `tools/amp-validation`)
- `npm start` (where `cwd` is `tools/amp-validation`)

It has it's own npm modules.
