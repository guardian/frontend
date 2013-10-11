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
    var crypto = require('crypto');
    var mkdirp = require('../../node_modules/mkdirp/index');
    var SVGO = require('../../node_modules/svgo/lib/svgo');
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

    var savings = 0;

    processSVG = function(files, file, callback) {
        if(files[file].match( /\.svg$/i )){
            // optimize SVG from current file
            var svgo = new SVGO();
            svgo.fromFile(files[file])
                .then(function(result) {
                    var inBytes =  (Math.round((result.info.inBytes / 1024) * 1000) / 1000),
                        outBytes = (Math.round((result.info.outBytes / 1024) * 1000) / 1000);

                    fs.writeFileSync(files[file], result.data);

                    savings += (inBytes - outBytes);

                    if(file < files.length-1){
                        processSVG(files, file + 1, callback);
                    } else {
                        console.log("Total savings: " + Math.round(savings) + "kb");
                        callback();
                    }
                }).done();
        } else {
            if(file < files.length-1){
                processSVG(files, file + 1, callback);
            }
        }
    };

    cleanSVG = function(src, callback) {
        var files = fs.readdirSync(src);

        for(var i=0, l= files.length; i < l; i++){
            files[i] = src + files[i];
        }

        processSVG(files, 0, callback);
    };

    //Load config from json file
    fs.readFile(process.argv[2], 'utf-8', function (err, data) {
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

        var spritepath = config.spritepath || "../images/";

        // css class prefix
        var cssprefix = config.cssprefix || "i-";

        // create the output directory
        if (!fs.existsSync( config.imgDest )) {
            mkdirp.sync( config.imgDest );
        }

        console.info( "Ouput css file created." );

        console.info( "Cleaning SVG" );
        cleanSVG(config.src, function(){


                // take it to phantomjs to do the rest
                console.info( "Now spawning phantomjs..." );

                utils.spawn({
                  cmd: '../../node_modules/phantomjs/bin/phantomjs',
                  args: [
                    'spricon-phantom.js',
                    config.src,
                    config.imgDest,
                    config.cssDest,
                    '',
                    datasvgcss,
                    datapngcss,
                    urlpngcss,
                    spritepath,
                    cssprefix,
                    cssbasepath,
                    generatesvg
                  ],
                  fallback: ''
                }, function(err, result, code) {
                    //If no error is returned from phantomjs
                    if(!err && code === 0) {

                        //Generate md5 hash of newly created sprite file
                        var md5sum = crypto.createHash('md5');
                        var s = fs.ReadStream(config.imgDest + 'sprite.png');

                        s.on('data', function(d) {
                          md5sum.update(d);
                        });

                        s.on('end', function() {
                            var hash = md5sum.digest('hex');

                            //Read the png sprite css file
                            var spriteData = fs.readFileSync(config.cssDest + config.urlpngcss, 'utf-8');

                            //Replace sprite file reference with hash
                            var newData = spriteData.replace(/sprite\.png/g, 'sprite.' + hash + '.png');

                            //Write back to file
                            fs.writeFileSync(config.cssDest + config.urlpngcss, newData, 'utf-8');

                        });

                        console.info("Spricon complete...");
                    } else {
                        console.error("Something went wrong with phantomjs...");
                    }
                });

        });

    });


