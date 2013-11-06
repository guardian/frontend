# curl.js module loaders

Each of these modules may be used to load non-AMD modules without specifying
an explicit plugin in your code.  Here's how they work:

1.	Organize your modules into packages.  curl.js uses packages to organize
	and configure modules.  Alternatively, you can use the `paths` config
	section to configure your packages if they have no "main" module or
	consist of a single file.
2.	Define your packages in a config object.  You can place the config object
	in your html file, but it's more typical to place it in a bootstrap
	file or module.  See below for some examples.
3. 	Use the `loader` config option to specify which of these module loaders
	to use.  Provide any options to the module loader alongside the `loader`
	config option.

curl.js's module loaders are just AMD plugins.  Therefore, you could
conceivably use any plugin as a module loader.  In practice, though, only
a few plugins are useful.  We like to use css! and json! plugins, for instance.

# Examples

Backbone as a legacy script and no residual global 'Backbone` variable:

```js
curl.config({
	// we're using `paths` here just as an example
    paths: {
        backbone: {
            location: 'modules/backbone-1.3.1/backbone.js',
            config: {
            	// use the legacy loader
                loader: 'curl/loader/legacy',
                // remove Backbone global! yes!
                exports: 'Backbone.noConflict()',
                // make sure jQuery and lodash are loaded
                requires: ['jquery', 'lodash']
            }
        }
    }
});
```

XYZ, a CommonJS package:

```js
curl.config({
    packages: [
        {
        	name: 'XYZ',
            location: 'modules/XYZ-1.3.1',
            // packages typically require a "main: module
            main: 'foo',
            config: {
            	// use the CommonJS Modules/1.1 loader
                loader: 'curl/loader/cjsm11',
                // tell the loader not to inject //@sourceURL
                injectSourceUrl: false
            }
        }
    ]
});
```

A "theme" package of css stylesheets:

```js
curl.config({
    packages: [
        {
        	name: 'theme',
            location: '../themes/css',
            config: {
            	// use the link plugin to load stylesheets dynamically
                loader: 'curl/plugin/link'
            }
        }
    ]
});
```
