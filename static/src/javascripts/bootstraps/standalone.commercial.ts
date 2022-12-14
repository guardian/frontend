/*
 * This standalone bundle is so called because it “stands alone”,
 * meaning it is not part of another webpack build process, and
 * can be imported as a JS <script>.
 *
 * See PR https://github.com/guardian/frontend/pull/24058
 *
 * The standalone commercial bundle is bundled from source files
 * here in Frontend, but is served from https://assets.guim.co.uk
 * in production DCR and Frontend.
 *
 * Changes here will be served on DCR & Frontend rendered pages.
 */

import '@guardian/commercial/standalone/build/fdc519d28fd6734107fe/graun.standalone.commercial';

export {};
