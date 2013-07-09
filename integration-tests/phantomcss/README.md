PhantomCSS
==========

*CSS regression testing*. An integration of [Resemble.js](http://huddle.github.com/Resemble.js/) with [PhantomJS](http://github.com/ariya/phantomjs/) and [CasperJS](http://github.com/n1k0/casperjs) for automating visual regression testing of Website styling to support refactoring of CSS.

### Why?

The problem with functional UI tests is that they make assertions on HTML markup, not the actual rendering. You can't know through automated tests if something has visually broke, too much margin, disabled state etc.  This situation is exacerbated by the increasing use of CSS3 for visual state changes that were traditionally built with JavaScript and DOM manipulation, ':target' pseudoclass or keyframes for example. Read more on Huddle's Engineering blog: [CSS Regression Testing](http://tldr.huddle.com/blog/css-testing/).

### How?

PhantomCSS takes screenshots captured by PhantomJS and compares them to baseline images using [Resemble.js](http://huddle.github.com/Resemble.js/) to test for rgb pixel differences with HTML5 canvas. PhantomCSS then generates image diffs to help you find the cause so you don't need to manually compare the new and old images.

PhantomCSS can only work when UI is predictable. It's possible to hide mutable UI components with PhantomCSS but it would be better if could drive the UI from faked data during test runs.  Take a look at [PhantomXHR](http://github.com/Huddle/PhantomXHR) for mocking XHR requests.

### Example

Check out the [demo](http://github.com/Huddle/PhantomCSS/tree/master/demo) for a full working example (run `phantomjs demo/testsuite.js` from the command line).

```javascript

var css = require('./modules/phantomcss.js');

css.init({
	libraryRoot: './modules/PhantomCSS',
	screenshotRoot: './screenshots',
	failedComparisonsRoot: './failures', // If this is not defined failure images can still be found alongside the original and new images
	testRunnerUrl: 'http://my.blank.page.html', //  needs to be a 'http' domain for the HTML5 magic to work
});

css.screenshot("#CSS .selector"/*, delay: 500, selector: '.elements-to-be-hidden', filename: 'my_webapp_feature'*/);

css.compareAll();


```

Please note that I have included the PhantomJS exe for convenience only, please follow the [PhantomJS install instructions](http://phantomjs.org/download.html) for custom and non-Windows environments.

### Workflow

* Define what screenshots you need in your regular tests
* Ensure that the 'compareAll' method gets called at the end of the test run
* Find the screenshot directory and check that they look as you expect.  These images will be used as a baseline.  Subsequent test runs will report if the latest screenshot is different to the baseline
* Commit/push these baseline images with your normal tests (presuming you're using a version control system)
* Run the tests again.  New screenshots will be created to compare against the baseline image.  These new images can be ignored, they will be replaced every test run. They don't need to be committed
* If there are test failures, image diffs will be generated.


### Another example

```javascript

css.init({
	libraryRoot: './modules/PhantomCSS',
	screenshotRoot: './screenshots',
	failedComparisonsRoot: './failures',
	testRunnerUrl: 'http://my.blank.page.html',

	addLabelToFailedImage: false, // Don't add label to generated failure image

	onFail: function(test){ console.log(test.filename, test.mismatch); },
	onPass: function(){ console.log(test.filename); },
	onTimeout: function(){ console.log(test.filename); },
	onComplete: function(allTests, noOfFails, noOfErrors){
		allTests.forEach(function(test){
			if(test.fail){
				console.log(test.filename, test.mismatch);
			}
		});
	},
	fileNameGetter: function(root,filename){ 
		// globally override output filename
		// files must exist under root
		// and use the .diff convention
		var name = root+'/somewhere/'+filename;
		if(fs.isFile(name+'.png')){
			return name+'.diff.png';
		} else {
			return name+'.png';
		}
	}
});

css.turnOffAnimations(); // turn off CSS transitions and jQuery animations

css.compareAll('exclude.test'); // String is converted into a Regular expression that matches on full image path

// css.compareMatched('include.test', 'exclude.test');
// css.compareMatched( new RegExp('include.test'), new RegExp('exclude.test'));


```

...You might also be interested in [PhantomFlow](http://github.com/Huddle/PhantomFlow), describe and visualise user flows through tests.


--------------------------------------

Created by [James Cryer](http://github.com/jamescryer) and the Huddle development team.
