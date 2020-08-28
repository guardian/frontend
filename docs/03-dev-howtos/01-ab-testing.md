# How to setup and run A/B tests

We have a homebrewed AB testing framework running in the application. The data it collects is logged with both Ophan and Omniture.

Most tests can be written in JavaScript, although we can serve variants via Varnish.

Read this if you want to [write a server-side AB Test](#write-a-server-side-test)

# Guide

There are six steps in the test lifecycle:

 - [Adding a switch to turn the test on & off](#adding-a-switch)
 - [Writing a test, which is typically a simple JS module](#writing-a-test)
 - [Running the test](#running-the-test)
 - [Analysis of the test data](#analysis-of-the-test-data)
 - [Share your findings](#share-your-findings)
 - Delete the test

## Quick Tips

- Creating your switch: if it's an ab test it should start with `ab-` (see more naming conventions in [Adding a switch](#adding-a-switch))
- Choosing your audience offset: it is good to avoid overlapping tests. You can check [here](https://frontend.gutools.co.uk/analytics/abtests) to see what tests are currently running, and what their offset is.
- Is your audience percentage appropriate for your test? Ask the data team if you don't know.
- Starting/Stopping a test: You can start and stop your tests in production at any time using the [switchboard](https://frontend.gutools.co.uk/dev/switchboard).
- Ophan has a dashboard with all the active AB tests [here](https://dashboard.ophan.co.uk/ab)

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
        showForSensitive: false,
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
- `showForSensitive`: This flag determines if the test should be active on articles marked as sensitive (`isSensitive` flag is true in the page config object). Note: If you had to force yourself into a test (see the [Forcing yourself into a test](#forcing-yourself-into-a-test) section), navigating to a sensitive article will permanently remove you from the test instead of merely deactivating it on that article and you'll have to force yourself into it again.
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

Do that here, `static/src/javascripts/projects/common/modules/experiments/ab-tests.js`. If your test can run alongside any other tests, add it to `concurrentTests`:

```
export const concurrentTests: $ReadOnlyArray<ABTest> = [
    commercialPrebidSafeframe,
    commercialAdVerification,
    commercialCmpCustomise,
    commercialAdMobileWebIncrease,
    commercialOutbrainNewids,
];
```

But for engagement banner and epic tests, only one of each runs per pageview. So if you're adding one of these, add it to the appropriate array:

```
export const epicTests: $ReadOnlyArray<EpicABTest> = [
    acquisitionsEpicUsTopTicker,
    acquisitionsEpicAuPostOneMillion,
    acquisitionsEpicFromGoogleDocOneVariant,
    acquisitionsEpicFromGoogleDocTwoVariants,
    acquisitionsEpicFromGoogleDocThreeVariants,
    acquisitionsEpicFromGoogleDocFourVariants,
    acquisitionsEpicFromGoogleDocFiveVariants,
    acquisitionsEpicAusEnvCampaign,
    acquisitionsEpicUSGunCampaign,
    askFourEarning,
    acquisitionsEpicAlwaysAskIfTagged,
    acquisitionsEpicLiveblog,
    acquisitionsEpicThankYou,
];

export const engagementBannerTests: $ReadOnlyArray<AcquisitionsABTest> = [
    AcquisitionsBannerUsEoy,
    AcquisitionsBannerAustraliaPostOneMillionTest,
    AcquisitionsBannerGoogleDocTestOneVariant,
    AcquisitionsBannerGoogleDocTestTwoVariants,
    AcquisitionsBannerGoogleDocTestThreeVariants,
    AcquisitionsBannerGoogleDocTestFourVariants,
    AcquisitionsBannerGoogleDocTestFiveVariants,
];
```

### Forcing yourself into a test
Add #ab-<TestName>=<VariantName> to the end of your URL (in dev or prod) to force yourself into a test.
e.g. www.theguardian.com/news#ab-MyGreatTest=GreenButton. **Note that this will only work if the `canRun` of your test and variant is true on that pageview.**

#### Firing complete events in dev mode
In prod, the completion events are fired based on the MVT ID cookie. This doesn't exist in dev, so if you need to test a complete event, force yourself into the test using the #ab-<TestName>=<VariantName> pattern described above.
This way, the `success` function of the test and variant you specify will be run, so you can test your completion behaviour.

### Detecting a user's bucket
You can use this code to check anywhere in your JS whether you're in a test bucket. You need to import `isInVariant` from ```'common/modules/experiments/ab'``` and your test object (in this example `FaciaSlideshowTest`).
```
if (isInVariant(FaciaSlideshowTest, 'variant')) {
    ///...
}
```

## Running the test

Release the test in to the wild just means deploying the frontend software, so you
can follow our standard [contributing guidelines](https://github.com/guardian/frontend/blob/master/CONTRIBUTING.md).

You can stop and start the test using our [switchboard](https://frontend.gutools.co.uk/dev/switchboard).

To see the test in action locally: `localhost:9000/[articleId]#ab-[testName]=[variantName]`

To see the tests you are part of using Google Chrome: open the `Dev Console -> Application -> Local Storage` and choose `http://[domain]` (e.g. localhost or www.theguardian.com)  -> check the `gu.ab.participations` row. You can also add `#experiments` to the URL to get an overlay on the left-hand side which shows the contents of `gu.ab.participations` and allows you to change them. **Note that if a test's `canRun` is false on that pageview, the participation will be removed from `gu.ab.participations` and therefore not appear in the `#experiments` overlay.**

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

# Write a Server-Side Test

If you want to set up your AB test with scala instead of javascript, almost all the steps are different.

*Advantages:*
- Allows you to run tests that just won't work in javascript ie if you want to render a whole different page
- Avoid javascript rendering problems (eg a jump if a DOM element is rendered and then hidden)

*Disadvantages:*
- Can only do AB tests, not multivariant ABC test
- Only one test can use a given bucket at a time eg. if someone is running a 50:50 test, you can't run a 50:50 until they finish (current setup)
- Slightly harder to set up, preview and read test results

## Configure the test

1. In `Experiments.scala`, create a new object for your test filling in author, and end date as per the other tests.

2. Ensure that the object name and the name property are the same - but formatted correctly.
eg: object `AudioChangeImagePosition` has the name property `audio-change-image-position`.

    ```
    object AudioChangeImagePosition extends Experiment(
      name = "audio-change-image-position",
      description = "Test the position of the image on audio pages",
      owners = Owner.group(SwitchGroup.Journalism),
      sellByDate = new LocalDate(2018, 8, 3),
      participationGroup = Perc50
    )

    ```
3. Add the experiment to the object property `ActiveExperiments.allExperiments` at the top of the file

4. Switch the test on for your local environment: http://localhost:9000/dev/switchboard You should be able to find it under `Serverside Tests`
NB: You should be running in `project dev-build` because you will need it to access the `/switchboard` screen

5. Incorporate the test in your code as a switch, eg:

    ```
    @import experiments.{ActiveExperiments, AudioChangeImagePosition}

    if(ActiveExperiments.isParticipating(AudioChangeImagePosition)) {
        //do variant thing
     }

    ```

NB: If your test suddenly stops working in local, check the switchboard again and make sure your test is still switched on.

Alternatively you can create your own switchboard to avoid your switch states being overridden by other developers.
Create a file `~/.gu/frontend.conf` and adding an entry to it like:

        devOverrides {
          switches.key=DEV/config/switches-<name>.properties
      }


## Checking the test

### Test on CODE:

- deploy branch to CODE
- switch AB test on for CODE: https://frontend.code.dev-gutools.co.uk/dev/switchboard

### Forcing yourself into the test

Severside AB tests use your session ID run through Fastly's Varnish configuration language (VCL) to assign you to a bucket.
Requests are bucketed in fixed groups in the [Guardian's VCL files](https://github.com/guardian/fastly-edge-cache/blob/0c366d7f8ef16a5b664fe7205cdd4bae57e07f56/theguardiancom/src/main/resources/varnish21/ab-tests.vcl), and frontend apps use the Vary response header to signify
multiple variants exist for the same request. [More information on how VCL enables AB tests here](https://github.com/guardian/frontend/pull/18320).


There are two ways to put yourself into a test:

*1. Use the opt/in link (can't be used on localhost):*

Copy the name of your test and visit this url: `https://www.theguardian.com/opt/in/your-test-name`
eg: `https://www.theguardian.com/opt/in/audio-page-change` this will redirect to the home page, but sets a cookie in your browser
that should tell the website to opt you into the test, for PROD. If `audio-page-change` is a 50% test, the resulting cookie
would be: `X-GU-Experiment-50perc : true`. For CODE or DEV environments, adapt the url accordingly.

Then navigate to the page where you should see the test and you should be opted into the variant.

To opt out you can use the url: `https://www.theguardian.com/opt/out/your-test-name`. `/opt` routes are defined [here](https://github.com/guardian/frontend/blob/master/applications/app/controllers/OptInController.scala#L42).

*2. Use a header hacker extension:*

Add the header `relevant-header-name: variant` to your request for a given page. eg: `X-GU-Experiment-50perc: variant`

A tool like the Chrome extension Header Hacker can help you to do this. You'll need to do this for the different urls you see the Guardian on: eg `localhost`, `https://code.dev-theguardian.com`. Ask for help configuring this if you need it.

Example Header Hacker configuration for putting yourself into a 50% test on CODE.

	```
    Custom Request Headers
	ServerTest3	X-GU-Experiment-50perc	Replace With	variant

    Permanent Header Switches
    https://code.dev-theguardian.com/	ServerTest3 (Replace X-GU-Experiment-50perc)

    ```

 ## Getting the results

Because it is a server-side test, different html will be rendered.

Give each component a different `data-component` attribute to distinguish them. This will show up in the `rendered components` list on the page view table.

You can check this in the Network tab of the page, by filtering for requests sent off to `ophan` and checking what's in the `renderedComponents` property.

In the data lake search for the presence of that rendered component. [Find out about querying the data lake here](https://github.com/guardian/frontend/blob/master/docs/03-dev-howtos/19-tracking-components-in-the-data-lake.md#rendered-components).

Correlate the presence of the element with the event you want to measure eg page ready, clicked play. Ophan events such as these can be added as per the clientside tests above.

