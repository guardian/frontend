This explains how to run an A/B test in frontend.

We have a homebrewed AB testing framework running in the application. The data it collects is logged with both Ophan and Omniture.

Most tests can be written in JavaScript, although we can serve variants via Varnish.

# Guide

There are six steps in the test lifecycle:-

 - Adding a switch to turn the test on & off
 - Writing a test, which is typically a simple AMD module
 - Running the test
 - Analysis of the test data
 - Share your findings
 - Delete the test

## Adding a switch

A switch allows you to stop and start the AB test outside of a normal software release cycle.

Inside, `./common/app/conf/switches/ABTestSwitches.scala` you want to create a Switch like this,

```
val ABFontDelaySwitch = Switch("A/B Tests", "ab-web-fonts-delay",
    "If this is switched on an AB test runs to measure the impact of not showing fallback fonts while fonts download.",
    safeState = Off)
```

The only convention is that the test id has to start with the characters _'ab-'_.


You will notice here that the switches we use to run our AB testing are the same switches we use to toggle features.

## Writing a test

A test is simply a JavaScript AMD module written to some conventions.

Tests live in `./static/src/javascripts/projects/common/modules/experiments/tests/`, so create a file in there.

```
define(['bonzo'], function (bonzo) {

    var GeoMostPopular = function () {

        this.id = 'GeoMostPopular';
        this.start = '2014-02-26';
        this.expiry = '2014-03-14';
        this.author = 'Richard Nguyen';
        this.description = 'Choose popular trails based on request location.';
        this.audience = 0.1;
        this.audienceOffset = 0.4;
        this.successMeasure = 'Click-through for the right most popular, and page views per visit.';
        this.audienceCriteria = 'Users who are not on mobile, viewing an article.';
        this.dataLinkNames = 'right hand most popular geo. Specific countries appear as: right hand most popular geo GB';
        this.idealOutcome = 'Click-through is increased on articles, mostly in US, Australia and India regions.';

        this.canRun = function(config) {
            return config.page.contentType === 'Article' && detect.getBreakpoint() !== 'mobile';
        };

        this.variants = [
            {
                id: 'control',
                test: function (context, config) {
                }
            },
            {
                id: 'hide',
                test: function (context, config) {
                    bonzo(context.querySelector('.js-related')).hide();
                }
            }
        ];
    };

    return GeoMostPopular;

});
```

The AMD module must return an object with the following properties,

- `id`: The unique name of the test.
- `start`: The planned start date of the test, the day when the test will be turned on.
- `expiry`: The date on which this test is due to stop running.
- `author`: The author of the test. They have responsibility for fixing and removing the test.
- `description`: A plain English summary of the test.
- `audience`: The ratio of people who you want in the test (Eg, 0.2 = 20%), who will then be split 50/50 between the control and variant.
- `audienceOffset`: All users are given a permanent, unique hash that is a number between 0 and 1. `audienceOffset` allows you to specify the range of
  users you want to test. For example, an `audienceOffset` value of `0.5` and an `audience` of `0.1` means user with a hash between 0.5 and 0.6 will
  be opted in to the test. This helps to avoid overlapping tests.
- `successMeasure`: Measurable traits that can be directed related to the hypothesis and objective (eg. CTR, Page Views per Visitor).
- `audienceCriteria`: Additional criteria on audience (eg. Desktop users only, Network Front entry users only).
- `dataLinkNames`: Link names or custom link names used for test.
- `idealOutcome`: What is the outcome that you want to see from the new variant (We want to see Y when we do X)?
- `canRun`: A function to determine if the test is allowed to run (Eg, so you can target individual pages, segments etc.).
- `variants`: An array of two functions - the first representing the _control_ group, the second the variant.  See "Detecting a user's bucket" below if you want to affect existing code rather than running new code.

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

### Detecting a user's bucket
You can use this code to check anywhere in your JS whether you're in a test bucket.
```
if (ab.testCanBeRun('FaciaSlideshow') &&
    ab.getTestVariantId('FaciaSlideshow') === 'slideshow') {
    ///...
}
```
The ```ab``` module is defined in ```'common/modules/experiments/ab'```.

## Running the test

Release the test in to the wild just means deploying the frontend software, so you
can follow our standard [contributing guidelines](https://github.com/guardian/frontend/blob/master/CONTRIBUTING.md).

You can stop and start the test using our [switchboard](https://frontend.gutools.co.uk/dev/switchboard).

## Analysis of the test data

### Omniture

For simple analysis of the data you can use [Omniture](https://sc.omniture.com)

The data is logged under the Omniture property _p51_.

### Ophan

We have an [AB test dashboard](https://frontend.gutools.co.uk/analytics/abtests) within the frontend tools project.

For inspection of the raw test data you can query the RedShift instance created by the data team.

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

Given we already have 2 repositories of user behaviour data (Omniture, Ophan/RedShift) creating a third just adds another silo. Typically the data is much easier to analyse in our existing tools.

Optimizely is relatively expensive - several thousand pounds p/month.

Optimizely is a client-side framework, which is limited for some types of testing.

It adds a rather large overhead to the cookie (mine is 2.5kb).
