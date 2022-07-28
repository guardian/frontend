## What does this change?

## Does this change need to be reproduced in dotcom-rendering ?

- [ ] No
- [ ] Yes (please indicate your plans for DCR Implementation)

## Screenshots

<!-- Please use the following table template to make image comparison easier to parse:

| Before      | After      |
|-------------|------------|
| ![before][] | ![after][] |

[before]: https://example.com/before.png
[after]: https://example.com/after.png

-->

## What is the value of this and can you measure success?

## Checklist

### Does this affect other platforms?

- [ ] AMP <!-- AMP question? https://github.com/guardian/frontend/blob/main/docs/03-dev-howtos/16-working-with-amp.md -->
- [ ] Apps
- [ ] Other (please specify)

### Does this affect GLabs Paid Content Pages? Should it have support for Paid Content?

<!-- if there are versions of this content with the paid styling (teal and grey) then they will need to be checked -->
<!-- content can be found here: https://www.theguardian.com/tone/advertisement-features -->

- [ ] No
- [ ] Yes (please give details)

### Does this change break ad-free?

<!-- The scope for this includes, but is not limited to, ad-slots, page targeting, podcasts, rich links, outbrain, -->
<!-- merchandising, page skins and paid-for content -->
<!-- If there's any chance it could cause problems, please test it with an appropriate test user or add a new test -->
<!-- scenario -->

- [ ] No
- [ ] It did, but tests caught it and I fixed it
- [ ] It did, but there was no test coverage so I added that then fixed it

### Does this change update the version of CAPI we're using?

<!-- Please see the notes linked below if you need further info. -->

- [ ] No, all the existing database files are just fine
- [ ] Yes, and I have [re-run all the tests locally and checked in all the updated data/database/xyz files](https://github.com/guardian/frontend/blob/main/docs/03-dev-howtos/15-updating-test-database.md)

### Accessibility test checklist

<!-- for changes that affect how a page appears in the browser -->

- [ ] [Tested with screen reader](https://accessibility.gutools.co.uk/testing/web/screen-readers/)
- [ ] [Navigable with keyboard](https://accessibility.gutools.co.uk/testing/web/keyboard-navigation/)
- [ ] [Colour contrast passed](https://accessibility.gutools.co.uk/testing/web/colour-contrast/)

### Tested

- [ ] Locally
- [ ] On CODE (optional)

<!-- AB test? https://github.com/guardian/frontend/blob/main/docs/03-dev-howtos/01-ab-testing.md -->
<!-- Does this PR meet the contributing guidelines? https://github.com/guardian/frontend/blob/main/.github/CONTRIBUTING.md -->

<!-- Unsure who to ask for a review? Tag https://github.com/orgs/guardian/teams/guardian-frontend-team to reach the team -->
