Introduction
============

Pasteup is where design meets development. It is where the Guardian’s globally recognised design language is turned into code for the web, and the starting point when styling Guardian branded products for both internal teams and third parties.

**Why Pasteup?** It's a newspaper term for "the assemblage of pages by pasting type onto page mockups, which are then photographed to be made into metal plates for the printing press" (courtesy of John E McIntyre). This is quite a nice metaphor for how client-side development builds the Guardian's pages. Plus it sounds cool.

Using Pasteup
========================

Link to Pasteup CSS and JavaScript files directly. The current URLs can be found at http://pasteup.guim.co.uk/index.html.

### Using Bower in your own build

You can install Pasteup using bower.

    > npm install -g bower
    > bower install pasteup

This will create a `components/pasteup` directory and you can reference Pasteup LESS and JS files directly in your own code. For example, in LESS:

    @import "components/pasteup/less/layout.less";
    @import "components/pasteup/less/zones.less";

Or in you `requirejs` paths configuration:

    paths: {
    	detect: "components/pasteup/js/modules/detect",
    	images: "components/pasteup/js/modules/images"
    }


Contributing to Pasteup
=======================

To build Pasteup you need the following installed:

* `nodejs`
* `npm`
* `grunt`

On linux you can run `> ./setup` to do this.

With these dependencies installed try the following.

`> grunt # Runs the build, starts server on http://localhost:3000 and watches files for changes.`

`> grunt build # Runs the build.`
