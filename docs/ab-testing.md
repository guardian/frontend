
This explains how to run an A/B test in frontend.

Frontend does not use [Optimizely](https://www.optimizely.com).

Instead we have a homebrewed AB testing framework running in the application. The data it collects is logged with both Ophan and Omniture.

For the moment we write tests in JavaScript, which limits their usefulness. With Varnish, and the ability to serve variants from
our CDN, then we can start to release server-generated varations at segments of our audience.

# Guide

There is four simple steps to releasing a test :-

 - Adding a switch to turn the test on & off
 - Writing a test, which is typically a simple AMD module
 - Running the test
 - Analysis of the test data

## Adding a switch

A switch allows you to stop and start the AB test outside of a normal software release cycle.

Inside, `common/app/conf/switches.scala` you want to create a Switch like this,

```
val FontDelaySwitch = Switch("A/B Tests", "web-fonts-delay",
    "If this is switched on an AB test runs to measure the impact of not showing fallback fonts while fonts download.",
    safeState = Off)
```

You also need to add it to the list of available switches at the foot of the same file,

```
val all: List[Switch] = List(
    FontDelaySwitch,
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
        this.audience = 0.2;
        this.description = 'Hides related content block on article to see if increases click through on most popular';
        this.canRun = function(config) {
          return (config.page && config.page.contentType === "Article" && document.querySelector('.js-related')) ? true : false;
        };
        this.variants = [
            {
                id: 'control',
                test: function () {
                   return true;
                }
            },
            {
                id: 'hide',
                test: function () {
                    bonzo(document.querySelector('.js-related')).hide();
                }
            }
        ];
    };

    return ExperimentRelatedContent;

});
```

The AMD module must return an object with the following properties,

- id: The unique name of the test.
- audience: The ratio of people who 0.2 = 20% of users will see the variant.
- description: A plain English summary of the test.
- canRun: A function to determine if the test is allowed to run (Eg, so you can target individual pages, segments etc.)
- variants: An array of two functions - the first representing the _control_ group, the second the variant.

You will also need to mark the module as a dependency of the AB testing module in `./common/app/assets/javascripts/modules/experiments/ab.js`,  

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

```

## Running the test

Release the test in to the wild just means deploying the frontend software, so you
can follow our standard [contributing guidelines](https://github.com/guardian/frontend/blob/master/CONTRIBUTING.md).

You can stop and start the test using our [switchboard](https://frontend.gutools.co.uk/dev/switchboard).

## Analysis of the test data

### Omniture

For simple analysis of the data you can use [Omniture](https://sc.omniture.com) 

### Ophan

For inspection of the raw test data you can query the RedShift instance created by the data team.
