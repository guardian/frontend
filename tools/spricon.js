/*
 * Spricon
 *
 * Sprite generator, heavily based on:
 * https://github.com/filamentgroup/unicon
 *
 */
 /*global node:true, console:true, process:true */

    var fs = require('fs');
    var spawn = require('child_process').spawn;
    var utils = {};
    var config;

    // Spawn a child process, capturing its stdout and stderr.
    utils.spawn = function(opts, done) {
      var child = spawn(opts.cmd, opts.args, opts.opts);
      var stdout = '';
      var stderr = '';
      child.stdout.on('data', function(buf) { stdout += buf; });
      child.stderr.on('data', function(buf) { stderr += buf; });
      // Node 0.8 no longer waits for stdio pipes to be closed before emitting the
      // exit event (grunt issue #322).
      var eventName = process.version.split('.')[1] === '6' ? 'exit' : 'close';
      child.on(eventName, function(code) {
        // To keep JSHint from complaining about using new String().
        var MyString = String;
        // Create a new string... with properties.
        var result = new MyString(code === 0 ? stdout : 'fallback' in opts ? opts.fallback : stderr);
        result.stdout = stdout;
        result.stderr = stderr;
        result.code = code;
        // On error, pass result object as error object.
        done(code === 0 || 'fallback' in opts ? null: result, result, code);
      });
      return child;
    };

    //Load config from json file
    fs.readFile('spricon-config.json', 'utf-8', function (err, data) {
        if (err) { throw err; }

        // just a quick starting message
        console.info( "Starting spricon\n" );

        //Parse the config file back into object
        config = JSON.parse(data);

        // fail if config or no src or dest config
        if( !config || config.src === undefined || config.imgDest === undefined || config.cssDest === undefined ){
          console.error( "Oops! Please provide a configuration for src and dest folders");
          return;
        }

        // make sure src and dest have / at the end
        if( !config.src.match( /\/$/ ) ){
            config.src += "/";
        }
        if( !config.imgDest.match( /\/$/ ) ){
            config.imgDest += "/";
        }
        if( !config.cssDest.match( /\/$/ ) ){
            config.cssDest += "/";
        }

        var generatesvg = config.svg || false;

        // CSS filenames with optional mixin from config
        var datasvgcss = config.datasvgcss || "_icons.data.svg.css";
        var datapngcss = config.datapngcss || "_icons.data.png.css";
        var urlpngcss = config.urlpngcss || "_icons.fallback.css";

        // css references base path for the loader
        var cssbasepath = config.cssbasepath || "/";

        // folder name (within the output folder) for generated png files
        var pngfolder = config.pngfolder || "png/";
        // make sure pngfolder has / at the end
        if( !pngfolder.match( /\/$/ ) ){
            pngfolder += "/";
        }

        // css class prefix
        var cssprefix = config.cssprefix || "icon-";
        
        // create the output directory
        fs.mkdir( config.imgDest );

        // create the output icons directory
        fs.mkdir( config.imgDest + pngfolder );

        console.info( "\nOuput css file created." );

        // take it to phantomjs to do the rest
        console.info( "\nNow spawning phantomjs..." );

        utils.spawn({
          cmd: 'phantomjs',
          args: [
            'phantom.js',
            config.src,
            config.imgDest,
            config.cssDest,
            '',
            datasvgcss,
            datapngcss,
            urlpngcss,
            pngfolder,
            cssprefix,
            cssbasepath,
            generatesvg
          ],
          fallback: ''
        }, function(err, result, code) {
            if(!err) {
                console.info("Spicon complete..");
            } else {
                console.error("\nSomething went wrong with phantomjs...");
            }
        });

    });


