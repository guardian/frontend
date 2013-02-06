Sprites
=======

Installation
------------

  * Get Node

        $ brew install node
    Or manually install from [nodejs.org](http://nodejs.org/)


  * Get PhantomJs

        $ brew install phantomjs
    Or manually install from [phantomjs.org](http://phantomjs.org/download.html)

  * Run `npm install` inside this directory to intall node module dependencies

Usage
-----

    $ node spricon.js global-icon-config.json

Notes
-----
This is a CSS icon and sprite generator for the Guardian's Frontend project. It is heavily based on the 
[Grunticon](https://github.com/filamentgroup/grunticon) grunt task made by the [Filament Group](http://filamentgroup.com/), 
 but differs in many ways due to our owns needs and project constraints.

 #### Differences
 - Removed grunt task api (We do not *currently* use grunt)
 - Cleans SVG files first
 - Does not generate Base64 png fallback CSS
 - Generates single .png sprite to reduce HTTP requests
 - Appends MD5 hash of genereated sprite file to CSS image-url() for cache busting purposes

 #### Todo
 - Use Javascript [bin packing algorthium](https://github.com/jakesgordon/bin-packing) to arrange icons inside sprite file.
 - Port back to grunt task!