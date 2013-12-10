var fs = require('fs');
var system = require('system');
host = (system.args[1]) || "http://localhost:9000/"


console.log("host is: "+host);
// CasperJS library
phantom.casperPath = '../../dev/casperjs';
phantom.injectJs(phantom.casperPath + '/bin/bootstrap.js');


// Populate global variables
var casper = require('casper').create({
	viewportSize: {width: 320, height: 800}
});

var css = require('./phantomcss.js');
var url = initPageOnServer('demo/testpage.html');

function resize_and_take_screenshot(width){
		casper.viewport(width,800)
		css.screenshot('body', 1000,'', 'screenshot_'+width+'.png');

}

function hide_variable_elements(){
		
		casper.waitForSelector('.ad-slot', function() {
			casper.evaluate(function(){
				document.querySelector('.js-popular').style.visibility = 'hidden';
				document.querySelector('footer').style.visibility = 'hidden';
				var ads = document.querySelectorAll('.ad-slot');
				Array.prototype.forEach.call(ads, function(el) {
				 	el.style.visibility = "hidden";
				});
			})
		});

}



css.init({
	screenshotRoot: './screenshots',
	failedComparisonsRoot: './failures',
	testRunnerUrl: url.emptyPage,
});

casper.
	start(url.testPage).
	then( function hide_elements(){
	hide_variable_elements();
	} ).
	then( function resize_and_take_screenshot_320(){
    resize_and_take_screenshot(320);

	}).
	then( function resize_and_take_screenshot_600(){
		resize_and_take_screenshot(600);
	}).
	then( function resize_and_take_screenshot_900(){
		resize_and_take_screenshot(900);
	}).
	then( function now_check_the_screenshots(){
		css.compareAll();
	}).


	run( function end_it(){
		console.log('\nTHE END.');
		phantom.exit(css.getExitStatus());
	});




function initPageOnServer(path){
	var server = require('webserver').create();
	var fs = require("fs");
	var html = fs.read(path);
	
	var service = server.listen(1337, function(request, response) {
		response.statusCode = 200;
		
		if(request.url.indexOf('empty') != -1){
			response.write('<html><body>This blank page is used for processing the images with HTML5 magics</body></html>');
		} else {
			response.write(html);
		}

		response.close();
	});

	return {
		testPage: host+'world/2013/jul/05/us-blocks-espionage-talks-europe-nsa-prism',
		emptyPage: 'http://localhost:1337/empty'
	};
}