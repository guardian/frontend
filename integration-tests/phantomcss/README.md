PhantomCSS
==========

*CSS regression testing*. An integration of [Resemble.js](http://huddle.github.com/Resemble.js/) with [PhantomJS](http://github.com/ariya/phantomjs/) and [CasperJS](http://github.com/n1k0/casperjs) for automating visual regression testing of Website styling to support refactoring of CSS.

To run article comparison at 320,600,900px:
``
cd integration-tests/phantomcss
phantomjs ./demo/guardian.js
``

Workflow
=========
If the comparison fails:
* If there are test failures, image diffs will be generated.
* View the new images in ./screenshots
* If you intend this to be the new baseline delete the screenshots folder, re-run the script and commit/push the new images in the ./screenshots folder, they will become the new baseline. 


--------------------------------------

Created by [James Cryer](http://github.com/jamescryer) and the Huddle development team.
