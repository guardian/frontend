This document explains how to create interactive content on theguardian.com.

## Interactives

An interactive comprises of a stand-alone javascript application wrapped in an AMD interface compatible with the next-gen project.

The interactive AMD module must return a function called `boot`.

What the interactive modules does after this is largely up to whoever is writing it.

This module can be uploaded in to s3 along with the rest of the interactive application and associated assets.

Here is a simple boilerplate using this pattern.

```
define(['your/dependencies'], function (dependency) {
    return {

        /**
         *
         * @param el        : The Element of the interactive that is being progressively enhanced. 
         * @param context   : The DOM context this module must work within.
         * @param config    : The configration object for this page. 
         *
        **/

        // 'boot' is a standard interface for our application to start the interactive
        boot: function (el, context, config) {

                // do something to bootstrap the interactive

            }
        }
    });
```

## Embedding the interactive in a page

Embedding the interactive in a page is the same as today. A page is created in r2, a URL is assigned, and an editor can publish it, at which point it will appear in the Content API.

When the page is delivered to the user the frontend code scans the DOM for interactives and loads each one.

Currently any URL with the `ng-interactive` with be routed to the interactive server.

The interactive code and boot.js must be housed in a corresponding location. This is a temporary limitation that will be
resolve when the Composer team deliver a means to embed interactives in articles.

For example, if the page lives here,

```
http://www.theguardian.com/world/australia-election-2013-interactive?view=mobile
```

Then the interactive boot.js must be hosted here,

```
http://interactive.guim.co.uk/next-gen/world/australia-election-2013-interactive/boot.js
```

## Examples

- [Media 100](http://www.theguardian.com/media/ng-interactive/2013/sep/02/media-100-2013-full-list?view=mobile)
- [Matthew Herbert music quiz](http://www.theguardian.com/music/interactive/2013/aug/20/matthew-herbert-quiz-hearing?view=mobile)
- [Australia Election 2013](http://www.theguardian.com/world/australia-election-2013-interactive?view=mobile)

Note how, in each of these examples, there is a &lt;figure> element in the source of the HTML with a `data-interactive` attribute.

Note, also how, in your web inspector network panel, the boot.js file is loaded, and subsequently loads the interactive application. 

## Notes

- Frontend currently use [curl.js](https://github.com/cujojs/curl) to load AMD modules.
- Interactives can be hosted on s3://gdn-cdn, which is mapped to [interactive.guim.co.uk](http://interactive.guim.co.uk).
- s3 [supports CORS](http://docs.aws.amazon.com/AmazonS3/latest/dev/cors.html).

## Previewing interactives on a localhost

All of the frontend applications are packaged as standalone JARs, so we can download and execute them like so,

```
wget -O applications.zip "http://guest:@teamcity.gudev.gnl:8111/httpAuth/repository/download/bt1193/.lastSuccessful/artifacts.zip" 
unzip applications.zip
java -DAPP_SECRET="" -jar packages/frontend-applications/frontend-applications.jar 
```

Nb. `bt1144` is the project identifier in Team City.  

The frontend applications will run on port 9000, so visit that port in a browser...

Eg, [http://localhost:9000/world/australia-election-2013-interactive](http://localhost:9000/world/australia-election-2013-interactive)

You can point them at different environments using ~/.gu/frontend.properties file

```
content.api.key=xxx
content.api.host=xxx
```

And you can preview and test on various devices using the techniques explained in
[testing externally on localhost](testing-externally-on-localhost.md).

## Composer 

_Nb. This section an outline of a proposal. Composer will not deliver this until Q4._

Composer is used to write (i) a basic accessible description of the interactive from within an article, (ii) define the URL to an
interactive application associated with that block.

For example, such a block might look like this as it comes out of Content API:-

```
<body>
    <h1>Headline</h1>
    <p>
        Article paragraph that has been written in Composer.
    </p>

    <!-- An accessible description of the interactive -->
    <figure class="interactive" data-interactive="http://path/to/interactive/boot.js">
        ...
        <caption>
            This is a chart describing the most polluted roads in London. 
        </caption>
    </figure>
    ...
</body>
```
