# EventEmitter [![Gitter](https://badges.gitter.im/Join Chat.svg)][gitter]

## Event based JavaScript for the browser

As the subtitle suggests, this script brings the power of events from platforms such as [node.js][] to your browser. Although it can be used on any other platform, I just built it with browsers in mind.

This is actually the fourth full rewrite of EventEmitter, my aim is for it to be faster and lighter than ever before. It also has a remapped API which just makes a lot more sense. Because the methods now have more descriptive names it is friendlier to extension into other classes. You will be able to distinguish event method from your own methods.

I have been working on it for over ~~a year~~ ~~two~~ three years so far and in that time my skills in JavaScript have come a long way. This script is a culmination of my learnings which you can hopefully find very useful.

## Dependencies

There are no hard dependencies. The only reason you will want to run `npm install` to grab the development dependencies is to build the documentation or minify the source code. No other scripts are required to actually use EventEmitter.

## Documentation

 * [Guide][]
 * [API][]

### Examples

 * [Simple][]
 * [RegExp DOM caster][]

## Contributing (aim your pull request at the `develop` branch!)

If you wish to contribute to the project then please commit your changes into the `develop` branch. All pull requests should contain a failing test which is then resolved by your additions. [A perfect example][example] was submitted by [nathggns][].

## Testing

Tests are performed using [Mocha][] and [Chai][], just serve up the directory using your local HTTP server of choice ([http-server][] is probably a good choice) and open up `tests/index.html`. You can also use the server scripts in the `tools` directory.

## Building the documentation

You can run `tools/doc.sh` to build from the JSDoc comments found within the source code. The built documentation will be placed in `docs/api.md`. I actually keep this inside the repository so each version will have it's documentation stored with it.

## Minifying

You can grab minified versions of EventEmitter from inside this repository, every version is tagged. If you need to build a custom version then you can run `tools/dist.sh`.

## Cloning

You can clone the repository with your generic clone commands as a standalone repository or submodule.

```bash
# Full repository
git clone git://github.com/Wolfy87/EventEmitter.git

# Or submodule
git submodule add git://github.com/Wolfy87/EventEmitter.git assets/js/EventEmitter
```

### Package managers

You can also get a copy of EventEmitter through the following package managers:
 * [NPM][] (wolfy87-eventemitter)
 * [Bower][] (eventEmitter)
 * [Component][] (Wolfy87/EventEmitter)

## License (MIT)

Copyright (c) 2011-2014 Oliver Caldwell

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[guide]: https://github.com/Wolfy87/EventEmitter/blob/master/docs/guide.md
[api]: https://github.com/Wolfy87/EventEmitter/blob/master/docs/api.md
[simple]: http://jsfiddle.net/Wolfy87/qXQu9/
[regexp dom caster]: http://jsfiddle.net/Wolfy87/JqRvS/
[npm]: https://npmjs.org/
[bower]: http://bower.io/
[component]: http://github.com/component/component
[mocha]: http://visionmedia.github.io/mocha/
[chai]: http://chaijs.com/
[issues]: https://github.com/Wolfy87/EventEmitter/issues
[example]: https://github.com/Wolfy87/EventEmitter/pull/46
[nathggns]: https://github.com/nathggns
[http-server]: https://www.npmjs.org/package/http-server
[node.js]: http://nodejs.org/
[gitter]: https://gitter.im/Wolfy87/EventEmitter?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
