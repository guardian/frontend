Requirements
------------

 * [Node.js](http://nodejs.org/)
 * [CasperJS](http://casperjs.org/)

Set-up
------

    $ npm install

Development
-----------

Run the script directly

    $ ENVIRONMENT=prod casperjs screenshot.js

Running
-------

Use the [Gruntfile.js](../../Gruntfile.js) in the root of this project

    $ ENVIRONMENT=prod grunt snap

To upload to S3, export

	AWS_ACCESS_KEY_ID=XXXXXX
	AWS_SECRET_ACCESS_KEY=XXXXXXX
