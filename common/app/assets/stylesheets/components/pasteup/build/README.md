Building Pasteup
================

The build and deploy code for Pasteup is written in nodejs, and is simple to run given version v0.6.13 or higher.

 - build.js runs through all the CSS, JS and module documentation and prepares them for deployment. This includes compilation of LESS files to CSS, along with minification and concatentation of CSS and JavaScript files. It also moves them into the /docs directory, ready for potential deployment.

 - server.js starts a http server on localhost port 3000 pointing at the current build. It also sets up a watch on the css, js and modules directories so that when you make changes the latest compiled versions are immediately available via the server for testing changes.

 - deploy.js pushes the latest version of Pasteup to Amazon S3. It depends on the s3cmd command line tool being configured with appropriate AWS authenticatino details.