
This explains how to run an A/B test in frontend.

We have a homebrewed AB testing framework running in the application. The data it collects is logged with both Ophan and Omniture.

For the moment we write tests in JavaScript, which limits their usefulness. With Varnish, and the ability to serve variants from
our CDN, then we can start to release server-generated varations at segments of our audience.

# Guide

There is five simple steps to releasing a test :-

 - Adding a switch to turn the test on & off
 - Writing a test, which is typically a simple AMD module
 - Running the test
 - Analysis of the test data
 - Share your findings

## Adding a switch

A switch allows you to stop and start the AB test outside of a normal software release cycle.

Inside, `common/app/conf/switches.scala` you want to create a Switch like this,

```
val FontDelaySwitch = Switch("A/B Tests", "ab-web-fonts-delay",
    "If this is switched on an AB test runs to measure the impact of not showing fallback fonts while fonts download.",
    safeState = Off)
```

The only convention is that the test id has to start with the characters _'ab-'_.

You also need to add it to the list of available switches at the foot of the same file,

```
val all: List[Switch] = List(
    FooSwitch,
    BarSwitch,
    ABFontDelaySwitch,
    ..
    )
```

You will notice here that the switches we use to run our AB testing are
the same switches we use to toggle features. 

## Writing a test

A test is simply a JavaScript AMD module written to some conventions.

Tests live in `./common/app/assets/javascripts/modules/experiments/tests/`, so create a file in there.

``` 
define(['bonzo'], function (bonzo) {

    var ExperimentRelatedContent = function () {

        this.id = 'RelatedContentV2';
        this.expiry = "2013-01-01";
        this.audience = 0.2;
        this.description = 'Hides related content block on article to see if increases click through on most popular';
        this.canRun = function(config) {
          return (config.page && config.page.contentType === "Article") ? true : false;
        };
        this.variants = [
            {
                id: 'control',
                test: function (context) { 
                   return true;
                }
            },
            {
                id: 'hide',
                test: function (context) {
                    bonzo(context.querySelector('.js-related')).hide();
                }
            }
        ];
    };

    return ExperimentRelatedContent;

});
```

The AMD module must return an object with the following properties,

- id: The unique name of the test.
- expiry: The date on which this test is due to stop running. Expressed as a string parsable by the JavaScript Date obejct.
- audience: The ratio of people who you want in the test (Eg, 0.2 = 20%), who will then be split 50/50 between the control and variant.
- description: A plain English summary of the test.
- events: Values of data-link-name attributes whose elements should listen for events to record for the test.
- canRun: A function to determine if the test is allowed to run (Eg, so you can target individual pages, segments etc.)
- variants: An array of two functions - the first representing the _control_ group, the second the variant.

You will also need to mark the module as a dependency of the AB testing module.

Do that here, `./common/app/assets/javascripts/modules/experiments/ab.js` 

```
define([
    'common',
    'modules/storage',

    //Current tests
    'modules/experiments/tests/story-article-swap'  //  add your module here.
], function (
    common,
    store,
    StoryArticleSwap) {
    
    var TESTS = {
            Related: new ExperimentRelatedContent()    //  and here. 
        };
    
    ...

    })
```

## Running the test

Release the test in to the wild just means deploying the frontend software, so you
can follow our standard [contributing guidelines](https://github.com/guardian/frontend/blob/master/CONTRIBUTING.md).

You can stop and start the test using our [switchboard](https://frontend.gutools.co.uk/dev/switchboard).

## Analysis of the test data

### Omniture

For simple analysis of the data you can use [Omniture](https://sc.omniture.com) 

The data is logged under the Omniture property _p51_.

### Ophan

For inspection of the raw test data you can query the RedShift instance created by the data team.

## Share your findings

At the very least summarize your findings by email or add a
[write-up](https://github.com/guardian/frontend/blob/master/docs/web-font-rendering-tests.md) to the frontend repository in markdown format.

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

You should also predict which varients are, in your eyes, going to provide the most positive improvements.

> - Magical recommendations algorithm
> - Control
> - Variant 1

# Why not Optimizely?

The r2-frontend project integrates [https://www.optimizely.com](https://www.optimizely.com). We decided to try an alternate approach.

Some things we do not like about Optimizely,

Optimizely relies on JQuery, which the frontend code does not use as a base JS library and do not want to add.

The Optimisely set-up allows _anyone_ to insert bits of code/design in to the site outside of a release cycle. While this sort of democratisation of AB testing is important we strongly feel, like all code/design/ux, the tests should follow this route through the review systems we have in place. Git pull etc.

Given we already have 2 repositories of user behaviour data (Omniture, Ophan/RedShift) creating a third just adds another silo. Typically the data is much easier to analyse in our existing tools.

Optimizely is relatively expensive - several thousand pounds p/month.

Optimizely is a client-side framework, which is limited for some types of testing. 
 
It adds a rather large overhead to the cookie (mine is 2.5kb).
