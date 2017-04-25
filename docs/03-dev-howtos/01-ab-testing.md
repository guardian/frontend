# How to setup and run A/B tests

We have a homebrewed AB testing framework running in the application. The data it collects is logged with both Ophan and Omniture.

Most tests can be written in JavaScript, although we can serve variants via Varnish.

# Guide

There are six steps in the test lifecycle:-

 - [Adding a switch to turn the test on & off](#adding-a-switch)
 - [Writing a test, which is typically a simple AMD module](#writing-a-test)
 - [Running the test](#running-the-test)
 - [Analysis of the test data](#analysis-of-the-test-data)
 - [Share your findings](#share-your-findings)
 - Delete the test

## Quick Tips

- Creating your switch: if it's an ab test it should start with `ab-` (see more naming conventions in [Adding a switch](#adding-a-switch)
- Choosing your audience offset: it is good to avoid overlapping tests. You can check [here](https://frontend.gutools.co.uk/analytics/abtests) to see what tests are currently running, and what their offset is.
- Is your audience percentage appropriate for your test? Ask the data team if you don't know.
- Starting/Stopping a test: You can start and stop your tests in production at any time using the [switchboard](https://frontend.gutools.co.uk/dev/switchboard).
- Ophan has a dashboard with all the active ab tests [here](https://dashboard.ophan.co.uk/ab)

## Adding a switch

A switch allows you to stop and start the AB test outside of a normal software release cycle.

Inside, `./common/app/conf/switches/ABTestSwitches.scala` you want to create a Switch like this,

```scala
val ABFontDelaySwitch = Switch("A/B Tests", "ab-web-fonts-delay",
    "If this is switched on an AB test runs to measure the impact of not showing fallback fonts while fonts download.",
    safeState = Off)
```

The convention is that the test id has to start with the characters _'ab-'_.

**The hyphen-separated id that follows `ab-` must correspond to the TitleCased id defined in the JS test module.
e.g. if the switch id is `ab-geo-most-popular`, the test id must be `GeoMostPopular`**


You will notice here that the switches we use to run our AB testing are the same switches we use to toggle features.

## Writing a test

A test is simply a JavaScript module written to some conventions.

Tests live in `./static/src/javascripts/projects/common/modules/experiments/tests/`, so create a file in there.

```js
import detect from 'lib/detect';

const geoMostPopular = () => {
    const properties = {
        id: 'GeoMostPopular',
        start: '2014-02-26',
        expiry: '2014-03-14',
        author: 'Richard Nguyen',
        description: 'Choose popular trails based on request location.',
        audience: 0.1,
        audienceOffset: 0.4,
        successMeasure: 'Click-through for the right most popular, and page views per visit.',
        audienceCriteria: 'Users who are not on mobile, viewing an article.',
        dataLinkNames: 'right hand most popular geo. Specific countries appear as: right hand most popular geo GB',
        idealOutcome: 'Click-through is increased on articles, mostly in US, Australia and India regions.',
    };

    Object.assign(this, properties);

    this.canRun = config =>
        config.page.contentType === 'Article' &&
        detect.getBreakpoint() !== 'mobile';

    this.variants = [
        {
            id: 'control',
            test(context, config) {
                context.querySelector('.js-related').classList.add('u-hidden');
            },

            impression(track) {
                /* call track() when the impression should be registered
                  (e.g. your element is in view) */
            },

            success(complete) {
                /* do something that determines whether the user has completed
                   the test (e.g. set up an event listener) and call 'complete'
                   afterwards */

                complete();
            }
        },
        {
            id: 'hide',
            test(context, config) { /* ... */ },

            impression(track) {
                /* call track() when the impression should be registered
                   (e.g. your element is in view) */
            },

            success(complete) {
                /* do something that determines whether the user has completed
                the test (e.g. set up an event listener) and call 'complete'
                afterwards */

                complete();
            }
        }
    ];
};

export geoMostPopular;
```

The module must return an object with the following properties,

- `id`: The unique name of the test. **This must be TitleCased and correspond to the hyphen-separated portion of the switch id that follows `ab-`. e.g. if the switch id is `ab-geo-most-popular`, this id must be `GeoMostPopular`**
- `start`: The planned start date of the test, the day when the test will be turned on.
- `expiry`: The date on which this test is due to stop running.
- `author`: The author of the test. They have responsibility for fixing and removing the test.
- `description`: A plain English summary of the test.
- `audience`: The ratio of people who you want in the test (Eg, 0.2 = 20%), who will then be split equally between the variants defined in the test.
- `audienceOffset`: All users are given a permanent, unique hash that is a number between 0 and 1. `audienceOffset` allows you to specify the range of
  users you want to test. For example, an `audienceOffset` value of `0.5` and an `audience` of `0.1` means user with a hash between 0.5 and 0.6 will
  be opted in to the test. This helps to avoid overlapping tests.
- `successMeasure`: Measurable traits that can be directed related to the hypothesis and objective (eg. CTR, Page Views per Visitor).
- `audienceCriteria`: Additional criteria on audience (eg. Desktop users only, Network Front entry users only).
- `dataLinkNames`: Link names or custom link names used for test.
- `idealOutcome`: What is the outcome that you want to see from the new variant (We want to see Y when we do X)?
- `canRun`: A function to determine if the test is allowed to run (Eg, so you can target individual pages, segments etc.).
- `variants`: An array of objects representing the groups in your test. See "Detecting a user's bucket" below if you want to affect existing code rather than running new code.
    - the variant objects can contain three properties:
        - variant.id: the name of the variant
        - variant.test: the main test function that applies the treatment for the test
        - variant.impression (optional): a function that's called to register the impression of the test. it receives a callback that you should call when you want to fire the impression. if not provided, the impression will fire on pageload (as long as canRun is true)
        - variant.success (optional): a function that's called alongside test that determines if the user has finished the test. it receives a callback as a parameter that you must call when the test is completed.


When choosing your audience offset, it is good to avoid overlapping tests. You can check [here](https://frontend.gutools.co.uk/analytics/abtests) to see what tests are currently running, and what their offset is.

You will also need to mark the module as a dependency of the AB testing module.

Do that here, `./common/app/assets/javascripts/modules/experiments/ab.js`

```
define([

    // Current tests
    'modules/experiments/tests/geo-most-popular'  //  add your module here.
], function (

    GeoMostPopular) {

    var TESTS = [
            new GeoMostPopular()    //  and here.
        ];

    ...

    })
```

### Forcing yourself into a test
Add #ab-<TestName>=<VariantName> to the end of your URL (in dev or prod) to force yourself into a test.
e.g. www.theguardian.com/news#ab-MyGreatTest=GreenButton

#### Firing complete events in dev mode
In prod, the completion events are fired based on the MVT ID cookie. This doesn't exist in dev, so if you need to test a complete event, force yourself into the test using the #ab-<TestName>=<VariantName> pattern described above.
This way, the `success` function of the test and variant you specify will be run, so you can test your completion behaviour.

### Detecting a user's bucket
You can use this code to check anywhere in your JS whether you're in a test bucket.
```
if (ab.isInVariant('FaciaSlideshow', 'variant')) {
    ///...
}
```
The ```ab``` module is defined in ```'common/modules/experiments/ab'```.

## Running the test

Release the test in to the wild just means deploying the frontend software, so you
can follow our standard [contributing guidelines](https://github.com/guardian/frontend/blob/master/CONTRIBUTING.md).

You can stop and start the test using our [switchboard](https://frontend.gutools.co.uk/dev/switchboard).

To see the test in action locally: `localhost:9000/[articleId]#ab-[testName]=[variantName]`

To see the tests you are part of using Google Chrome: open the Dev Console -> Resources -> Local Storage -> choose `http://[domain]` (e.g. localhost or www.theguardian.com)  -> check the `gu.ab.participations` row. ~~Alternatively, if you're using Chrome, use the [extension](https://chrome.google.com/webstore/detail/guardian-ab-tests/nehbenedinjacnhlkjbdneedibcagmno).~~ (currently broken as it does not support our new Webpack-bundled application)

## Analysis of the test data

### Omniture

For simple analysis of the data you can use [Omniture](https://sc.omniture.com)

The data is logged under the Omniture property _p51_.

### Ophan

We have an [AB test dashboard](https://frontend.gutools.co.uk/analytics/abtests) within the frontend tools project.

Ophan also has a [dashboard](https://dashboard.ophan.co.uk/ab) where you can take a look at your test data

For inspection of the raw test data you can query the datalake created by the data team.

## Share your findings

At the very least summarize your findings by email.

# Designing a test

Some notes from Greg Detre.

## Hypothesis

In other words, what are you trying to prove? For example,

> We could do more with the bottom of the article and that related content is boring.

## Buckets

Each AB test have a control group and _n_ variants, or buckets. For example,

> - Control - Shows related content
> - Variant 1 = Hide related content box
> - Variant 2 = Hide related content AND top 5 site links
> - Variant 3 = Magical recommendations algorithm
> - Variant 4 = Random links

## Prediction

What metrics do you think will improve? Writing this down before the test helps

For example,

> - Bounce rate is going to improve by 1%
> - Time on page increase by 5%
> - Page views per visit increase twofold

You should also predict which variants are, in your eyes, going to provide the most positive improvements.

> - Magical recommendations algorithm
> - Control
> - Variant 1

# Why not Optimizely?

The r2-frontend project integrates [https://www.optimizely.com](https://www.optimizely.com). We decided to try an alternate approach.

Some things we do not like about Optimizely,

Optimizely relies on JQuery, which the frontend code does not use as a base JS library and do not want to add.

The Optimizely set-up allows _anyone_ to insert bits of code/design in to the site outside of a release cycle. While this sort of democratisation of AB testing is important we strongly feel, like all code/design/ux, the tests should follow this route through the review systems we have in place. Git pull etc.

Given we already have 2 repositories of user behaviour data (GA, Ophan) creating a third just adds another silo. Typically the data is much easier to analyse in our existing tools.

Optimizely is relatively expensive - several thousand pounds p/month.

Optimizely is a client-side framework, which is limited for some types of testing.

It adds a rather large overhead to the cookie (mine is 2.5kb).
