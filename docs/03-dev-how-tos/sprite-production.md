Sprite production
----------------

The production of sprite .png images can now be generated automatically using the "Spricon" helper tools inside toosl/sprites.

The tool uses a simple node application and the headless webkit browser phantomjs to loop through a folder of assets (preferably .svg's) and embeds them side-by-side in a webpage, it then renders the preview of the webpage as a single .png output, aka the sprite file.

It then uses each images offset x/y to generate the css declarations and background-position offsets needed to display. At the same time it also generates a base64 encoded version of each image to progressively enhance for browser that can support.

Finally it makes an MD5 hash of the sprite file and replaces the url() declaration in the css to include the md5 hash.


Installation
------------

You need to have both node.js and phantom.js on your path for the application to run.

Node can be found here:
http://nodejs.org/

Phantomjs here:
http://phantomjs.org/


Config
-------
The tool allows us to have separate files for separate assets/modules. For instance one for global assets and one for comment related assets.

Each group needs a config.json file to tell the tool where to find the assets and where to output.

```
{
 "src": "../../common/app/assets/images/", // Where to find the source images
 "cssDest": "../../common/app/assets/stylesheets/theme/", // Where to output the generated css
 "datasvgcss" : "_global-icons-svg.scss", // What to name the base64 encoded css file
 "urlpngcss" : "_global-icons-sprite.scss", // What to name the sprite css file
 "spritepath" : "/assets/images/", // Where to output the sprite file
 "svg" : true // Whether or not to generate base64 encoded svg
}
```

Running the tool
---------------

To run the tool navigate to the tools/sprites directory and run:

node spricon.js name-of-config.json

Any errors in compilation will appear in stderr.




