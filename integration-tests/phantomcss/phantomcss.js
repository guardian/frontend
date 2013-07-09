/*
Author: James Cryer
Company: Huddle
Last updated date: 20 Jun 2013
URL: https://github.com/Huddle/PhantomCSS
More: http://tldr.huddle.com/blog/css-testing/
*/

var fs = require('fs');

var _root = '.';
var _diffRoot = false;
var _count = 0;
var _realPath;
var _diffsToProcess = [];
var _emptyPageToRunTestsOn;
var _libraryRoot = '.';
var exitStatus;
var _hideElements;
var _addLabelToFailedImage = true;
var _test_match;
var _test_exclude;

exports.screenshot = screenshot;
exports.compareAll = compareAll;
exports.compareMatched = compareMatched;
exports.init = init;
exports.update = init;
exports.turnOffAnimations = turnOffAnimations;
exports.getExitStatus = getExitStatus;

function init(options){
	casper = options.casper || casper;
	_emptyPageToRunTestsOn = options.testRunnerUrl || _emptyPageToRunTestsOn;
	_libraryRoot = options.libraryRoot || _libraryRoot;
	_root = options.screenshotRoot || _root;
	_diffRoot = options.failedComparisonsRoot || _diffRoot;
	_fileNameGetter = options.fileNameGetter || _fileNameGetter;

	_onPass = options.onPass || _onPass;
	_onFail = options.onFail || _onFail;
	_onTimeout = options.onTimeout || _onTimeout;
	_onComplete = options.onComplete || options.report || _onComplete;

	_hideElements = options.hideElements;

	if(options.addLabelToFailedImage !== undefined){
		_addLabelToFailedImage = options.addLabelToFailedImage;
	}
}

function turnOffAnimations(){
	console.log('Turning off animations');
	casper.evaluate(function turnOffAnimations(){
		window.addEventListener('load', function(){

			var css = document.createElement("style");
			css.type = "text/css";
			css.innerHTML = "* { -webkit-transition: none !important; transition: none !important; }";
			document.body.appendChild(css);

			if(jQuery){
				$.fx.off = true;
			}
		},false);
	});
}

function _fileNameGetter(root, fileName){
	var name;

	fileName = fileName || "screenshot";
	name = root + fs.separator + fileName + "_" + _count++;

	if(fs.isFile(name+'.png')){
		return name+'.diff.png';
	} else {
		return name+'.png';
	}
}

function screenshot(selector, timeToWait, hideSelector, fileName){
	casper.captureBase64('png'); // force pre-render
	casper.wait(timeToWait || 250, function(){

		if(hideSelector || _hideElements){
			casper.evaluate(function(s1, s2){
				if(s1){
					$(s1).css('visibility', 'hidden');
				}
				$(s2).css('visibility', 'hidden');
			}, {
				s1: _hideElements,
				s2: hideSelector
			});
		}

		try{
			casper.captureSelector( _fileNameGetter(_root, fileName) , selector);
		}
		catch(ex){
			console.log("Screenshot FAILED: " + ex.message);
		}

	}); // give a bit of time for all the images appear
}

function asyncCompare(one, two, func){

	if(!casper.evaluate(function(){ return window._imagediff_;})){
		initClient();
	}

	casper.fill('form#image-diff', {
		'one': one,
		'two': two
	});

	casper.evaluate(function(filename){
		window._imagediff_.run( filename );
	}, {
		label: _addLabelToFailedImage ? one : false
	});

	casper.waitFor(
		function check() {
			return this.evaluate(function(){
				return window._imagediff_.hasResult;
			});
		},
		function () {

			var mismatch = casper.evaluate(function(){
				return window._imagediff_.getResult();
			});

			if(Number(mismatch)){
				func(false, mismatch);
			} else {
				func(true);
			}

		}, function(){
			func(false);
		},
		10000
	);
}

function getDiffs (path){

	var filePath;

	if(({'..':1,'.':1})[path]){ return true; }

	if(_realPath){
		_realPath += fs.separator + path;
	} else {
		_realPath = path;
	}

	filePath = _realPath;

	if(fs.isDirectory(_realPath) ){
		fs.list(_realPath).forEach(getDiffs);
	} else {
		if( /\.diff\./.test(path.toLowerCase()) ){
			if(_test_match){
				if( _test_match.test(_realPath.toLowerCase()) ){
					if( !(_test_exclude && _test_exclude.test(_realPath.toLowerCase())) ){
						console.log('Analysing', _realPath);
						_diffsToProcess.push(filePath);
					}
				}
			} else {
				if( !(_test_exclude && _test_exclude.test(_realPath.toLowerCase())) ){
					_diffsToProcess.push(filePath);
				}
			}
		}
	}

	_realPath = _realPath.replace(fs.separator + path, '');
}

function compareMatched(match, exclude){
	_test_match = typeof match === 'string' ? new RegExp(match) : match;
	compareAll(exclude);
}

function compareAll(exclude){
	var tests = [];
	var fails = 0;
	var errors = 0;

	_test_exclude = typeof exclude === 'string' ? new RegExp(exclude) : exclude;
	_realPath = undefined;

	_diffsToProcess = [];

	getDiffs(_root);

	_diffsToProcess.forEach(function(file){
		var baseFile = file.replace('.diff', '');
		var test = {
			filename: baseFile
		};

		if(!fs.isFile(baseFile)) {
			test.error = true;
			errors++;
			tests.push(test);
		} else {
			casper.
			thenOpen (_emptyPageToRunTestsOn, function (){
				asyncCompare(baseFile, file, function(isSame, mismatch){

					if(!isSame){

						test.fail = true;
						fails++;

						if(mismatch){
							test.mismatch = mismatch;
							_onFail(test);
						} else {
							_onTimeout(test);
						}

						casper.waitFor(
							function check() {
								return casper.evaluate(function(){
									return window._imagediff_.hasImage;
								});
							},
							function () {
								var failFile, safeFileName, increment;

								if(_diffRoot){
									// flattened structure for failed diffs so that it is easier to preview
									failFile = _diffRoot + fs.separator + file.split(fs.separator).pop().replace('.diff.png', '');
									safeFileName = failFile;
									increment = 0;

									while ( fs.isFile(safeFileName+'.fail.png') ){
										increment++;
										safeFileName = failFile+'.'+increment;
									}

									failFile = safeFileName + '.fail.png';

									casper.captureSelector(failFile, 'img');
								}

								casper.captureSelector(file.replace('.diff.png', '.fail.png'), 'img');

								casper.evaluate(function(){
									window._imagediff_.hasImage = false;
								});

							}, function(){},
							10000
						);
					} else {
						_onPass(test);
					}

					tests.push(test);
				});
			});
		}
	});

	casper.then(function(){
		casper.waitFor(function(){
			return _diffsToProcess.length === tests.length;
		}, function(){
			_onComplete(tests, fails, errors);
		}, function(){},
		10000);
	});
}

function initClient(){

	casper.page.injectJs(_libraryRoot+fs.separator+'resemble.js');

	casper.evaluate(function(){
		
		var result;

		var div = document.createElement('div');

		// this is a bit of hack, need to get images into browser for analysis
		div.style = "display:block;position:absolute;border:0;top:-1px;left:-1px;height:1px;width:1px;overflow:hidden;";
		div.innerHTML = '<form id="image-diff">'+
			'<input type="file" id="image-diff-one" name="one"/>'+
			'<input type="file" id="image-diff-two" name="two"/>'+
		'</form><div id="image-diff"></div>';
		document.body.appendChild(div);

		window._imagediff_ = {
			hasResult: false,
			hasImage: false,
			run: run,
			getResult: function(){
				window._imagediff_.hasResult = false;
				return result;
			}
		};

		function run(label){

			function render(data){
				document.getElementById('image-diff').innerHTML = '<img src="'+data.getImageDataUrl(label)+'"/>';
				window._imagediff_.hasImage = true;
			}

			resemble(document.getElementById('image-diff-one').files[0]).
				compareTo(document.getElementById('image-diff-two').files[0]).
				ignoreAntialiasing(). // <-- muy importante
				onComplete(function(data){
					var diffImage;

					if(Number(data.misMatchPercentage) > 0.05){
						result = data.misMatchPercentage;
					} else {
						result = false;
					}

					window._imagediff_.hasResult = true;

					if(Number(data.misMatchPercentage) > 0.05){
						render(data);
					}
					
				});
		}
	});
}

function _onPass(test){
	// console.log('.'); just for progress indication
}
function _onFail(test){
	console.log('FAILED: ('+test.mismatch+'% mismatch)', test.filename, '\n');
}
function _onTimeout(test){
	console.log('TIMEOUT: ', test.filename, '\n');
}
function _onComplete(tests, noOfFails, noOfErrors){

	if( tests.length === 0){
		console.log("\nMust be your first time?");
		console.log("Some screenshots have been generated in the directory " + _root);
		console.log("This is your 'baseline', check the images manually. If they're wrong, delete the images.");
		console.log("The next time you run these tests, new screenshots will be taken.  These screenshots will be compared to the original.");
		console.log('If they are different, PhantomCSS will report a failure.');
	} else {
		
		console.log("\nPhantomCSS found: " + tests.length + " tests.");
		
		if(noOfFails === 0){
			console.log("None of them failed. Which is good right?");
			console.log("If you want to make them fail, go change some CSS - weirdo.");
		} else {
			console.log(noOfFails + ' of them failed.');
			console.log('PhantomCSS has created some images that try to show the difference (in the directory '+_diffRoot+'). Fuchsia colored pixels indicate a difference betwen the new and old screenshots.');
		}

		if(noOfErrors !== 0){
			console.log("There were " + noOfErrors + "errors.  Is it possible that a baseline image was deleted but not the diff?");
		}

		exitStatus = noOfErrors+noOfFails;
	}
}

function getExitStatus() {
	return exitStatus;
}
