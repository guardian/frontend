'use strict';

var grunt = require('grunt');

// Majority of test benefit comes from running the task itself.
// This is kept around for future use.

function runTemplate(src,context) {
  var source = grunt.file.read(src);
  return grunt.util._.template(source, context);
}

// Just strips whitespace for now. Should do a proper min of everything
// but this is working well enough for now.
function normalize(html) {
  return html.replace(/\s*/g,'');
}

exports.jasmine = {
  defaultTemplate: function(test) {
    test.expect(1);

    var context = {
      css  : ['css/a.css'],
      scripts : {
        jasmine   : ['J1.js','J2.js'],
        helpers   : ['H1.js','H2.js'],
        specs     : ['SPEC1.js','SPEC2.js'],
        src       : ['SRC1.js','SRC2.js'],
        vendor    : ['V1.js','V2.js'],
        reporters : ['R1.js'],
        start     : ['START.js']
      },
      options : {}
    };

    var actual = runTemplate('./tasks/jasmine/templates/DefaultRunner.tmpl', context);
    var expected = grunt.file.read('./test/expected/defaultTemplate.html');

    test.equal(normalize(actual),normalize(expected), 'default test runner template');

    test.done();
  }
};
