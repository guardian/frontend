# Table Of Contents
*(Do NOT edit manually. Generated automatically)*

## [Start here](01-start-here/)
- [Quick start guide](01-start-here/01-installation-steps.md)
- [Visual glossary of the Guardian.com](01-start-here/02-guardian-visual-glossary.md)
- [How to deploy](01-start-here/03-how-to-deploy.md)
- [Troubleshooting](01-start-here/04-troubleshooting.md)
- [Development tips](01-start-here/05-development-tips.md)
- [Testing tips](01-start-here/06-testing-tips.md)
- [FAQs](01-start-here/07-faqs.md)
- [Incident handling](01-start-here/08-incidents.md)

## [Architecture](02-architecture/)
- [The different applications composing the Guardian website](02-architecture/01-applications-architecture.md)
- [Fronts architecture](02-architecture/02-fronts-architecture.md)
- [Libraries we use](02-architecture/03-libraries-we-use.md)
- [Archiving](02-architecture/04-archiving.md)
- [Architecture principles for CSS](02-architecture/05-architecture-principles-for-css.md)
- [Javascript](02-architecture/06-client-side-architecture.md)

## [Dev howtos](03-dev-howtos/)
- [How to setup and run A/B tests](03-dev-howtos/01-ab-testing.md)
- [Deployment](03-dev-howtos/02-deployment.md)
- [Guardian embeds](03-dev-howtos/03-embeds.md)
- [Inline SVGs](03-dev-howtos/04-inline-svgs.md)
- [Interactives](03-dev-howtos/05-interactives.md)
- [Repressing fronts](03-dev-howtos/06-repressing.md)
- [Sprite production](03-dev-howtos/07-sprite-production.md)
- [Template Deduping](03-dev-howtos/08-template-deduping.md)
- [Testing externally on your localhost](03-dev-howtos/09-testing-externally-on-localhost.md)
- [Testing AMIs or provisioning in AWS](03-dev-howtos/10-testing-platform.md)
- [Accessing HTTP access logs for your localhost](03-dev-howtos/11-access-logs-for-your-localhost.md)
- [Update configuration in Systems Manager Parameter Store](03-dev-howtos/12-Update-configuration.md)
- [Overriding default configuration](03-dev-howtos/14-override-default-configuration.md)
- [Updating the test database](03-dev-howtos/15-updating-test-database.md)
- [Working with Google AMP](03-dev-howtos/16-working-with-amp.md)
- [Working with emails](03-dev-howtos/17-working-with-emails.md)
- [Apply the special report tone](03-dev-howtos/18-apply-the-special-report-tone.md)
- [Tracking components in the Data Lake](03-dev-howtos/19-tracking-components-in-the-data-lake.md)
- [Updating Social Media Overlay Images](03-dev-howtos/20-update-overlay-images.md)
- [Testing Reader Revenue Components](03-dev-howtos/21-test-reader-revenue-components.md)
- [Access Preview Locally](03-dev-howtos/22-access-preview-locally.md)
- [Sport Tournaments](03-dev-howtos/23-sport-tournaments.md)
- [Pointing to CODE CAPI](03-dev-howtos/24-pointing-to-CODE-CAPI.md)

## [Quality](04-quality/)
- [Browsers support](04-quality/01-browser-support.md)
- [Browser support principles](04-quality/02-browser-support-principles.md)
- [Accessibility](04-quality/03-accessibility.md)
- [Security](04-quality/04-security.md)

## [Commercial](05-commercial/)
- [⚠️ Moved to https://github.com/guardian/commercial-core/blob/3a8c75e619c2e4ac2d731d251f5bf186f7af89dd/docs/GAM-Advertising.md ⚠️](05-commercial/01-DFP-Advertising.md)
- [Integration of commercial components](05-commercial/02-commercial-components.md)
- [Standalone Commercial Bundle](05-commercial/03-commercial-javascript.md)
- [Non-refreshable line items](05-commercial/04-non-refreshable-line-items.md)

## [Features and components](06-features-and-components/)
- [How are trail pictures picked in Frontend?](06-features-and-components/01-trail-images.md)
- [Tag combiners](06-features-and-components/03-tag-combiners.md)

## [Performance](07-performance/)
- [Performance reading list](07-performance/01-performance-reading.md)

## [Archives](99-archives/)
- [Recipe for Breton crêpes](99-archives/crepes.md)
- [theguardian.com/font-loader](99-archives/font-loader-route.md)


---
# META: How to create a new documentation file

## Documentation conventions

- Find the correct subdirectory your new documentation file belongs to.
- Every documentation file should be markdown (with .md extension).
- First line of every documentation file should contain its title (used to generated the table of content).
- Store all the images in an `/images` subfolder in the same directory the document referencing them will be.
- Table of content (TOC) is generated automatically with every commit, all changes will be staged accordingly.
