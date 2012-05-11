Frontend Common
===============

This project contains common elements of the Guardian Frontend applications
including:
* Images and other assets
* Model
* Configuration and other utility code

How to release
--------------

* Checkout or pull the git://github.com:guardian/guardian.github.com.git.
 repository (Note :SBT expects this to be immediately under your home directory
 at ~/guardian.github.com)
* Ensure that your frontend-common checkout is from master, is clean and
 up to date.
* Remove '-SNAPSHOT' from the appVersion val in project/FrontendCommon.scala.
* Run ./sbt011 publish.
* Bump the appVersion number in project/FrontendCommon.scala and restore the
 '-SNAPSHOT' affix.
* Commit and push the FrontendCommon.scala change (at this stage you will
 ensure that only you are releasing this version, any conflict means you should
 probably start over, resetting both the guardian.github.com and frontend-common
 checkouts).
* cd ~/guardian.github.com
* Run ./update-directory-index.sh
* Commit and push the new files and updated indexes

