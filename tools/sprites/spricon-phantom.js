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
  [11] - styleguide HTML fragment directory path
  [12] - styleguide HTML fragment filename
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
var styleguidepath = phantom.args[11];
var styleguidefilename = phantom.args[12];

var sprite = require( "webpage" ).create();
    sprite.viewportSize = { width: 600, height: 1 };
    sprite.content = '<html><body><div id="container" style="overflow:auto;"></div></body></html>';

var tableOpeningHTML = '<table class="styleguide-table styleguide-table-two-col sprite-table"><thead><tr><th class="type-11">CSS selector</th><th class="type-11">Output</th></tr></thead><tbody>';
var outputHTML = [];
var tableClosingHTML = '</tbody></table>';

// add a single reference to the sprite background
pngcssrules.push(".i { background-repeat: no-repeat; display: inline-block; }");


// increment the current file index and process it
function nextFile(){
    currfile++;
    processFile();
}

// files have all been processed. write the css and html files and return
function finishUp(){

    //Set viewport to containers width and height
    sprite.viewportSize = sprite.evaluate(function() {
        //Cache container
        var container = document.getElementById('container');

        return { width: container.offsetWidth, height: container.offsetHeight };
    });

    //Generate sprite
    sprite.render( imgOutputdir + "sprite.png" );

    // write CSS files
    fs.write( cssOutputdir + fallbackcss, pngcssrules.join( "\n\n" ) );
    if(generatesvg) { fs.write( cssOutputdir + datacss, '@if ($svg-support) {' + "\n" + datacssrules.join( "\n\n" ) + "\n" + '}' ); }

    // write HTML file
    var tableHTML = tableOpeningHTML + outputHTML.join( "\n" ) + tableClosingHTML;
    fs.write( styleguidepath + styleguidefilename,  tableHTML);
}

// process an svg file from the source directory
function processFile() {
    var theFile = files[ currfile ];
    var tableRowHTML = '';

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
                    datacssrules.push( "    .svg-" + cssprefix + filenamenoext +" { background-image: url(" + svgdatauri + "); background-position: 0 0; background-repeat: no-repeat; }\n    .svg ." + cssprefix + filenamenoext + " { @extend .svg-" + cssprefix + filenamenoext +"; }" );
                }

                // build HTML table for style guide
                tableRowHTML = '<tr><td class="type-9">.' + cssprefix + filenamenoext + '</td><td class="sprite-cell"><i class="i ' + cssprefix + filenamenoext + '"></i></td></tr>';
                outputHTML.push(tableRowHTML);

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
                        placeholder.style.margin = '1px 1px 0 0'; // prevents the sprite icons from leaking
                        placeholder.innerHTML = svgdata;
                        var svgel = placeholder.querySelector('svg');

                        document.getElementById('container').appendChild(placeholder);

                        return {
                            x: placeholder.offsetLeft,
                            y: placeholder.offsetTop,
                            w: Math.round(svgel.getAttribute('width')),
                            h: Math.round(svgel.getAttribute('height'))
                        };

                    }, svgdata);


                    pngcssrules.push( "." + cssprefix + filenamenoext + " { background-position: -" + coords.x + "px -" + coords.y + "px; width: " + coords.w + "px; height: " + coords.h + "px; }");

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