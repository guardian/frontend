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

## How do I find the unused templates?

The idea is to compute `all templates` - `used templates`:
- `all templates`: every twirl template (`.scala.html`) that exists in this codebase.
- `used templates`: every distinct template that was actually rendered in production (i.e. logged in Athena) with a non-`false` `dcr` value.

### 1. List all the templates in this codebase

Twirl compiles a template into a class whose name is derived from its path relative to the `app/` source directory, with an `html` segment inserted right after the `views` directory. So:
- `<module>/app/views/fragments/atoms/chart.scala.html` → `views.html.fragments.atoms.chart`
- `sport/app/football/views/wallchart/page.scala.html` → `football.views.html.wallchart.page` (any package segments _before_ `views`, such as `football`, `cricket` or `rugby`, are kept)

The following command lists every template using that same normalised naming, so the output can be compared directly against the `template` column in Athena:

```bash
find . -name '*.scala.html' \
  | sed -E 's#.*/app/##; s#(^|/)views/#\1views/html/#; s#\.scala\.html$##; s#/#.#g' \
  | sort -u
```

Run it from the root of the repo. As of July 2026, it lists 490 templates, e.g. `views.html.fragments.atoms.chart`.

### 2. List the unused templates via Athena

Paste the output of the command above into the `all_templates` CTE below (replacing `<list-of-templates-in-codebase>`), then run the query. It returns every template that exists in the codebase but was never rendered in production with a non-`false` `dcr` value.

```sql
WITH all_templates (template) AS (
  VALUES
    -- Replace this placeholder with the output of the `find | sed` command above,
    -- formatted as one quoted, comma-separated value per line, e.g.:
    -- ('views.html.fragments.atoms.chart'),
    -- ('views.html.atomEmbed'),
    <list-of-templates-in-codebase>
),
used_templates AS (
  SELECT DISTINCT template
  FROM twirl_usage
  WHERE dcr <> 'false'
)
SELECT a.template
FROM all_templates a
LEFT JOIN used_templates u ON a.template = u.template
WHERE u.template IS NULL
ORDER BY a.template;
```

## We don't need it anymore, how do we delete it?

This feature was created with the following PRs:
- https://github.com/guardian/frontend/pull/28895
- https://github.com/guardian/platform/pull/2284
- https://github.com/guardian/platform/pull/2289
- https://github.com/guardian/frontend/pull/28937
- https://github.com/guardian/platform/pull/2293
- https://github.com/guardian/frontend/pull/28968

To completely remove these capabilities you'll need:
- A first `frontend` PR that:
  - deletes the `template-tracker-agent` directory at the root of this repo
  - deletes the `templateTrackerAgent` module in sbt, and associated variables, as well as the `withTwirlInstrumentation` variables and all of its usages
- A second `platform` PR that:
  - Removes the custom fluent-bit configuration [introduced here](https://github.com/guardian/platform/pull/2289/changes#diff-18bd302d25fb5e54cb207c132df35e930d96714eeafdaa44508d15135a5f9e10)
