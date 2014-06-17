Contributing
============

Setting up an Environment
~~~~~~~~~~~~~~~~~~~~~~~~~

To run the test suite and run our code linter, node.js and npm are required. If you don't have node installed, `get it here <http://nodejs.org/download/>`_ first.

Installing all other dependencies is as simple as:

.. code-block:: sh

    $ npm install

And if you don't have `Grunt <http://gruntjs.com/>`_ already, feel free to install that globally:

.. code-block:: sh

    $ npm install -g grunt-cli

Running the Test Suite
~~~~~~~~~~~~~~~~~~~~~~

The test suite is powered by `Mocha <http://visionmedia.github.com/mocha/>`_ and can both run from the command line, or in the browser.

From the command line:

.. code-block:: sh

    $ grunt test

From your browser:

.. code-block:: sh

    $ grunt run:test

Then visit: http://localhost:8000/test/

Compiling Raven.js
~~~~~~~~~~~~~~~~~~

The simplest way to compile your own version of Raven.js is with the supplied grunt command:

.. code-block:: sh

    $ grunt build

By default, this will compile raven.js and all of the included plugins.

If you only want to compile the core raven.js:

.. code-block:: sh

    $ grunt build.core

Files are compiled into ``build/``.

Contributing Back Code
~~~~~~~~~~~~~~~~~~~~~~

Please, send over suggestions and bug fixes in the form of pull requests on `GitHub <https://github.com/getsentry/raven-js>`_. Any nontrivial fixes/features should include tests.
Do not include any changes to the ``dist/`` folder or bump version numbers yourself.

Documentation
-------------

The documentation is written using `reStructuredText <http://en.wikipedia.org/wiki/ReStructuredText>`_, and compiled using `Sphinx <http://sphinx-doc.org/>`_

Documentation can be compiled by running:

.. code-block:: sh

    $ make docs

Then viewing in your browser with:

.. code-block:: sh

    $ grunt run:docs

Releasing New Version
~~~~~~~~~~~~~~~~~~~~~

* Bump version numbers in both ``package.json`` and ``bower.json``.
* ``$ grunt dist`` This will compile a new version and update it in the ``dist/`` folder.
* Confirm that build was fine, etc.
* Commit new version, create a tag. Push to GitHub.
* ``$ grunt publish`` to recompile all plugins and all permutations and upload to S3.
* Confirm that the new version exists behind ``cdn.ravenjs.com``
* Update version in the ``gh-pages`` branch specifically for http://ravenjs.com/.
* glhf
