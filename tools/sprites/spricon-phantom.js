/*
 * Spricon
 *
 * Sprite generator, heavily based on:
 * https://github.com/filamentgroup/unicon
 *
 */

/*global phantom:true*/
/*global window:true*/
/*global btoa:true*/

/*
phantom args sent from app.js:
  [0] - input directory path
  [1] - img output directory path
  [2] - css output directory path
  [3] - asyncCSS output file path
  [4] - CSS filename for datasvg css
  [5] - CSS filename for datapng css
  [6] - CSS filename for urlpng css
  [7] - png folder name //Deprecated
  [8] - css classname prefix
  [9] - css basepath prefix
  [10] - generate svg boolean
*/

var fs = require( "fs" );
var inputdir = phantom.args[0];
var imgOutputdir = phantom.args[1];
var cssOutputdir  = phantom.args[2];
var spritepath =  phantom.args[7];
var cssprefix = phantom.args[8];
var files = fs.list( inputdir );
var currfile = 0;
var pngcssrules = [];
var pngdatacssrules = [];
var datacssrules = [];
var htmlpreviewbody = [];
var fallbackcss = phantom.args[6];
var pngdatacss = phantom.args[5];
var datacss = phantom.args[4];
var cssbasepath = phantom.args[9];
var generatesvg = phantom.args[10];

var sprite = require( "webpage" ).create();
    sprite.viewportSize = { width: 600, height: 'auto' };
    sprite.content = '<html><body><div id="container" style="overflow:auto;"></div></body></html>';

// increment the current file index and process it
function nextFile(){
    currfile++;
    processFile();
}

// files have all been processed. write the css and html files and return
function finishUp(){

    //Set viewport to containers width and hieght
    sprite.viewportSize = sprite.evaluate(function() {
        //Cache container
        var container = document.getElementById('container');

        return { width: container.offsetWidth, height: container.offsetHeight };
    });

    //Generate sprite
    sprite.render( imgOutputdir + "sprite.png" );

    // write CSS files
    fs.write( cssOutputdir + fallbackcss, pngcssrules.join( "\n\n" ) );
    if(generatesvg) { fs.write( cssOutputdir + datacss, datacssrules.join( "\n\n" ) ); }
}

// process an svg file from the source directory
function processFile() {
    var theFile = files[ currfile ];

    if( theFile ){
        // only parse svg files
        if( theFile.match( /\.svg$/i ) ){
          
            (function(){

                var page = require( "webpage" ).create();
                var svgdata = fs.read(  inputdir + theFile ) || "";
                var svgdatauri = "data:image/svg+xml;base64,";
                var pngdatauri = "data:image/png;base64,";

                // kill the ".svg" at the end of the filename
                var filenamenoext = theFile.replace( /\.svg$/i, "" );

                // get svg element's dimensions so we can set the viewport dims later
                var frag = window.document.createElement( "div" );
                frag.innerHTML = svgdata;
                var svgelem = frag.querySelector( "svg" );
                var width = svgelem.getAttribute( "width" );
                var height = svgelem.getAttribute( "height" );

                // get base64 of svg file
                svgdatauri += btoa(svgdata);

                //If we want to generate base64 svg css
                if(generatesvg) {
                    // add rules to svg data css file
                    datacssrules.push( ".svg-" + cssprefix + filenamenoext + " { background-image: url(" + svgdatauri + "); background-repeat: no-repeat; background-position: 0 0; }" );
                }

                // set page viewport size to svg dimensions
                page.viewportSize = {  width: parseFloat(width), height: parseFloat(height) };

                // open svg file in webkit to make a png
                page.open(  inputdir + theFile, function( status ){

                    // create png file
                    //page.render( imgOutputdir + filenamenoext + ".png" );

                    var coords = sprite.evaluate(function(svgdata) {
                        var placeholder = document.createElement('div');
                        placeholder.style.display = 'block';
                        placeholder.style.float = 'left';
                        placeholder.innerHTML = svgdata;
                        var svgel = placeholder.querySelector('svg');

                        document.getElementById('container').appendChild(placeholder);

                        return { x: placeholder.offsetLeft, y: placeholder.offsetTop, w: svgel.getAttribute('width'), h: svgel.getAttribute('height') };

                    }, svgdata);

                  pngcssrules.push( "." + cssprefix + filenamenoext + " { background-image: url(" + spritepath + "sprite.png ); background-repeat: no-repeat; background-position: -" + coords.x + "px -" + coords.y + "px; width: " + coords.w + "; height: " + coords.h + "; }");
                  
                  // process the next svg
                  nextFile();
                });

          }());
        }
        else {
            // process the next svg
            nextFile();
        }
  }
  else {
    // fin
    finishUp();
    phantom.exit();
  }
}

// go ahead with the first file
processFile();