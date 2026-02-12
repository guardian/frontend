# Testing tips

1. [Running localhost](#running-localhost)
2. [Testing AMP](#testing-amp)
3. [Device Testing](#device-testing)
4. [Testing local on CODE](#testing-your-local-on-code)


# Running localhost

### Get credentials from janus
Before you do anything else on your local frontend build, navigate to the janus page
and follow the steps to get your credentials for Frontend and for CMS-Fronts.
This will save you grief later on.

### Install and compile all third party dependencies
To install third party dependencies and compile your assets as they would on production, use this command:
```
  make compile
```
If you wish to install dependencies and compile the assets in compile -dev mode, to allow real-time code compilation for testing of local branches, use the following:

```
make compile-dev
```

The make command can also be used for a variety of other useful things including testing and linting javascript.
Run the command:
```
make list
```
to see a full list of the available make commands.

### What project to run
In general, the best project to run is "dev-build".  Dev-build: is a project that combines multiple applications for ease of testing.
Most of the time it is both convenient and reliable, however in some cases you might prefer to use the project containing the application you are changing.
See: https://github.com/guardian/frontend/blob/main/dev-build/conf/routes - to learn more about what is supported in dev-build.

To test a particular application. See the following for guidance on what content is served by what application:
 https://github.com/guardian/frontend/blob/main/docs/02-architecture/01-applications-architecture.md

### Running unit tests
To run the scala unit tests for a given application, navigate to the project
 that corresponds to the application in question and enter:
```
  test
```
To run all the scala unit tests. execute this command from the root project.

To run only the tests for a particular test suite, use the command:
```
  test-only *<name-of-your-test-suite>
```

# Testing AMP

### Testing AMP Pages on local build
Amp pages are available for articles and liveblogs.
Whenever you are making a significant frontend change - especially one that has any on any templates, or changes files within the article application, you should be sure to check the display of an amp page to make sure it looks alright.

When running frontend locally, the AMP version of pages can be viewed by adding the `?amp` querystring to the end of the URL. For example:

```
http://localhost:9000/world/2015/oct/15/obama-delay-withdrawal-us-troops-afghanistan?amp
```

### Amp validation on local
Amp pages must pass validation in order to be displayed in Google search results.
If an Amp page fails validation it is highly unlikely it will ever be served to a user.
It is important to test Amp pages pass validation as part of any checking for frontend changes.

To test this on a page run from local, request an amp page as shown above, and add the fragment `#development=1` to the end of the URL. For example:

```
http://localhost:9000/world/2015/oct/15/obama-delay-withdrawal-us-troops-afghanistan?amp#development=1
```

Before committing any frontend changes, you should also run the Amp validation tests.
This is done by first running dev-build or article project on your local machine.
In a new terminal tab, navigate to the frontend project and run:

```
make validate-amp
```

### Testing Amp pages on the live website
Occasionally you might need to check something in production on the live website - for example display of a particular ad-tag
To see an amp page, navigate to:
                    https://amp.theguardian.com/<path-to-page>.

To see the page as user from google would see it, on a mobile device (emulated or otherwise) navigate to:
                    https://www.google.co.uk/amp/s/amp.theguardian.com/<path-to-page>
Google will detect you are on a mobile device and serve you the amp page.
This is useful for tests where the path to the page matters. For instance any tests for ad tags should use this method

### Amp validation on the live website
 For amp pages on the live site, you can append the "#development=1" fragment to the url to show validation in the developer console,
   or alternatively you can enter the page url on https://ampbench.appspot.com/
   This last is superior in the feedback it gives you as you can drill a bit more into validation errors.

### Things to watch for on Amp pages
1) That you actually are on an amp page.
This is more relevant to testing on production where you might often be looking at the flow from
google-search result to the amp page. The following will indicate you are on an amp page:
    - In prod the url starts with `amp.` instead of `www.`
    - The code host is `amp.code.dev-theguardian.com`
    - On local, the url has the `?amp` querystring described above
    - The styling of the nav header is different
    - The developer tools console has a message "Powered by AMP"
2) That ads display ok.
3) That styling, especially that of badges and graphical punctuation, such as quotes  look ok
4) That images and other embeds display correctly - especially on narrow screens such as the iPhone5S


# Device Testing

### How to test your devices on local
- It is possible to use chrome emulator to get a good idea of how android devices behave and XCode the hardware simulators on XCode to do the same for iOS,
However for significant frontend changes you should test on devices as much as possible. To do this you need to be able to make your localhost accessible.
A tool called `ngrok` is a good way to make a local port accessible to external devices or computer (instructions on how to run ngrok [here](https://github.com/guardian/frontend/blob/main/docs/03-dev-howtos/09-testing-externally-on-localhost.md))
- To test on a variety of devices or to reproduce a bug on a particular set up, use https://www.browserstack.com. This site has a vaery large collection of various operating systems, browsers and devices. It contains a good record of old versions of these and has a mix of real and emulated devices. It is a very useful testing resource. Contact the dotcom team to get added to our user account for this tool

### What to test on
A list of useful information on device testing follows:
- [Our browser support principals](https://github.com/guardian/frontend/blob/main/docs/04-quality/02-browser-support-principles.md)
- [A list of what browsers we support](https://github.com/guardian/frontend/blob/main/docs/04-quality/01-browser-support.md)
- [Ranking of the current top browsers](https://github.com/guardian/frontend/blob/main/docs/04-quality/01-browser-support.md)
- [Breakdown of last seven days web traffic by type of device](https://dashboard.ophan.co.uk/graph/breakdown?days=7&device=Personal+computer&device=Smartphone&device=Tablet&by=device)

### Good places/tricks to find bugs
- iPhone - Safari is the most popular browser on iOS (which makes it one of the most popular ways to view our site) and even Chrome on iOS has to use the iOS Webkit framework.
 It is interesting from a testing perspective because it is a different operating system, different browser setup and different screen-size from the machine you are developing on.
 This combination often throws up interesting layout problems. In addition Safari often has less support for new features compared with Chrome, which can also lead to rendering errors.

- Edge - a new browser from microsoft - meant to be a successor to IE. [As of Sept 2016](https://docs.google.com/a/guardian.co.uk/spreadsheets/d/1bheEcdkOAj6jA92U37_DsTpQDwk7awIAFkYKUE1fbsw/edit?usp=sharing) it has overtaken IE11 in popularity. However it gets much less exposure to our developers than Chrome, Firefox and Safari.

- IE11 - This is the most popular IE version. IE is notorious for having less support for features and also being much less tolerant of small errors than Chrome, or Firefox. Often when a page renders on those browsers it will still have problems on IE.

- IE9 Our expectations for IE9 are lower than for more recent browsers, however it should be possible to access our content and the page should at least look readable.

- Chrome and Firefox on windows 10 - Windows10 is slowly overtaking Windows7 as our users most popular desktop OS. When Windows 10 originally came out, firefox had some rendering issues and Chrome and firefox periodically show rendering issues there - especially with things like fonts.

- Older devices - A common source of problems comes from older devices. Where the device is running the latest operating system, it will attempt to run all the latest features and give the fullest experience. This can be catastrophic if the device just doesnt have the memory or processing power to cope.
  This is especially important if your feature is very resource heavy. For reasons unknown, but possibly connected to the way safari manages memory, iOS devices have proved more susceptable. Good examples of old devices to test on are: iPhone 4S, iPad3 (both known to be prone to crashes) and the Samsung Galaxy S3.
    [Interesting page talking about iOS crashes](http://stackoverflow.com/questions/22039534/ios-browser-crashes-due-to-low-memory). As a result of a large number of crashes on iPads, it has been necessary to limit all iPads to only showing the non-enhanced version of network and section fronts.

- non-enhanced pages - features should either be hidden or have a way of displaying on non-enhanced versions of pages. To see the non-enhanced version of a page use the links [here](https://www.theguardian.com/info/2015/sep/22/making-theguardiancom-work-best-for-you).

- Devices with strange screen sizes. If you're interested in layout and rendering for your change, the iphone 5S is a popular device with an abnormally narrow screen, the Galaxy S4 mini is a miniaturised version of the GalaxyS4 with a very small screen. The iPad Mini and Galaxy Note also have interesting dimensions and have shown layout issues from time to time - especially on fronts.

- Rotate your device - another layout trick that is always worth doing. Load the page and rotate from portrait to landscape.
   Refresh and rotate from landscape to portrait. This is a common cause of redrawing in the real world that can often show up issues. A good device to test this on is the Nexus7 - this is because the portrait and landscape views on this device correspond to different screen-width breakpoints.

- Test on AMP! [Google are making amp the default in mobile search results](http://searchengineland.com/amp-live-in-google-259109).
Currently there are lots of dependencies and many changes that don't seem to be directly related to AMP will have an impact on the display of amp pages.

### How to find examples of pages you want to test
By default your local build will be pulling in data from the live CAPI. So the stories you see will match those on the live site.
This is useful as it makes it very easy to check if a problem is unique to your branch or already present in production.
If you are testing embeds, it can be hard to find examples to test on. [This page](https://s3-eu-west-1.amazonaws.com/capi-wpt-querybot/pageElementSamplePages.html) gives a list of example pages that contain a particular embed.
Also make sure your change conforms to the [guardian-visual-glossary](https://github.com/guardian/frontend/blob/main/docs/01-start-here/02-guardian-visual-glossary.md)


# Testing your local on CODE
There are times when you are testing something locally that you just can’t find on our production content, for instance:
	- Implementing new template or embed types.
	- Testing hard to find embed types - ie a Guardian Witness embed.
	- Testing Triggered events - such as a liveblog update.
To test these type of changes you can use a frontend.conf file to override the default build and tailor it to your needs.
See [here](https://github.com/guardian/frontend/blob/main/docs/03-dev-howtos/14-override-default-configuration.md) for details.

Some points about CODE. The CODE composer does not actually produce content for the m.code website.
 Instead, content produced by the code composer can be found at https://viewer.code.dev-gutools.co.uk/proxy/preview/<path to your content>
 To get the path to your content, you can either access it from the furniture tab, or preview the content and then copy everything in the url after /preview.
  eg for `https://viewer.code.dev-gutools.co.uk/preview/technology/2016/oct/14/testing-witness-embed`
  the path to content would be `/technology/2016/oct/14/testing-witness-embed`.
  This is useful if you are pointing to code and you wish to compare the change you have made on your branch to the current `main` branch.

 Its worth noting that the fronts you will see - even when setting the facia stage to code, or indeed using the fronts tool in code-composer - will all
 source their content from the live site to populate the containers.
 This means that there is no way to create a piece of content on code then surface it to a front on your local machine or on code.





