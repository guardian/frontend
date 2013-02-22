# EventEmitter

## Event based JavaScript for the browser

As the subtitle suggests, this script brings the power of events from platforms such as [node.js](http://nodejs.org/) to your browser. Although it can be used on any other platform, I just built it with browsers in mind.

This is actually the fourth full rewrite of EventEmitter, my aim is for it to be faster and lighter than ever before. It also has a remapped API which just makes a lot more sense. Because the methods now have more descriptive names it is friendlier to extension into other classes. You will be able to distinguish event method from your own methods.

I have been working on it for over a year so far and in that time my skills in JavaScript have come a long way. This script is a culmination of my learnings which you can hopefully find very useful.

## Documentation

 * [Guide](https://github.com/Wolfy87/EventEmitter/blob/master/docs/guide.md)
 * [API](https://github.com/Wolfy87/EventEmitter/blob/master/docs/api.md)

### Building the documentation

First you will need to install [dox](https://github.com/visionmedia/dox) and [LinkedIn's fork of dust](http://linkedin.github.com/dustjs/) using [npm](https://npmjs.org/). You can do that with the following command.

    npm install dox dustjs-linkedin

Or by running `tools/deps.sh` to fetch all dependencies required by the repository.

Then you can run `tools/doc.sh` to build from the JSDoc comments found within the source code. The built documentation will be placed in `docs/api.md`. I actually keep this inside the repository so each version will have it's documentation stored with it.

## Minifying

You can grab minified versions of EventEmitter from [the downloads page](https://github.com/Wolfy87/EventEmitter/downloads). If you need to build a custom version then you will first need to install the uglifyjs node module (`npm install uglify-js@2.2.0`) and then you can run `tools/dist.sh`. You can also fetch the dependencies by running `tools/deps.sh`. The script takes one optional argument which specifies the version that should be placed in the minified files name, `4.0.0` for example. If not passed then it defaults to `dev`.

So with a version passed you will get a file name like `dist/EventEmitter-4.0.0.min.js`, without one you will be left with this `dist/EventEmitter-dev.min.js`.

## Cloning

You can clone the repository with your generic clone commands as a standalone repository or submodule.

    # Full repository
    git clone git://github.com/Wolfy87/EventEmitter.git
    
    # Or submodule
    git submodule add git://github.com/Wolfy87/EventEmitter.git assets/js/EventEmitter

If you wish to run the tests you will also need to fetch the required submodules. You can do that with the following command.

    git submodule update --init

Alternatively you can execute `tools/deps.sh` to fetch all required dependencies for the repository.

If you only need the script itself you may want to look at [the downloads page](https://github.com/Wolfy87/EventEmitter/downloads).

### Bower

You can also get a copy of EventEmitter through the [Bower package manager](https://github.com/twitter/bower). Simply run `bower install eventEmitter`.

## Testing

Tests are performed using Jasmine in the following browsers via [BrowserStack](http://www.browserstack.com/).

 * Firefox
 * Chrome
 * Opera
 * Safari
 * IE6+

When testing in the more modern browsers, not Internet Explorer basically, I run it through the very early versions, some midrange versions and the very latest ones too. I don't just do the latest version.

EventEmitter will always be tested and working perfectly in all of them before a release. I will not release anything I think is riddled with bugs. However, if you do spot one, please [submit it as an issue](https://github.com/Wolfy87/EventEmitter/issues) and I will get right on it.

## License (MIT)

Copyright (c) 2012 Oliver Caldwell

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.