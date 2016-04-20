# Libraries we use
If you are developing something and haven't got a clue where to start, some of this might be good pointers.
## front end
Qwery - find stuff in the DOM
https://github.com/ded/qwery

Bonzo - a thing for modifying the DOM
https://github.com/ded/bonzo

Bean - an events library for components
https://github.com/fat/bean

Reqwest - an Ajax library
https://github.com/ded/reqwest

## back end
Play - the application server
https://playframework.com/

### Node dependencies
We also have a set of Node dependencies, used mostly by our static asset pipeline. We use npm to manage these.

When you want to add or update a dependency:

```
npm install <package>@<version> --save
npm shrinkwrap
node dev/clean-shrinkwrap.js
```
