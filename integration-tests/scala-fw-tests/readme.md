Introduction
============
The purpose of this module is to run a series of specialised tests against the live/production environment. The thought is that being able to know that something is broken in production should then stop you from deploying new functionality until the problem has been fixed. This is achieved by running the integration tests as part of the build chain in CI (TeamCity) and if they fail should prevent a build being able to complete. However there should by a bypass option so that you can deploy a fix.

So to reiterate the requirements for these tests:
* They shall target live/production environment
* They shall run as part of the normal build chain and prevent a deployment to production if the tests fails
* There shall be a workaround to deploy a fix to prod, despite the tests failing

Workflow
===========
The fundamental difficulty with tests running against live (post deploy) in a build chain of artifacts that are going to live (pre deploy) is that the tests are not verifying the artifacts, which it is build together with, but rather against artifacts which are already in production.

This effectively means that any test failure which are seen are from a previous deployment, rather than the deployment for which it is built together with. And since that is a requirement it creates a somewhat un-intuitive work flow for when running builds and fixing test.

Below is a screenshot of the proposed build chain configuration in Team City with tests passing.

![Alt text](doc/build_chain_success.png?raw=true "Build chain with tests passing")

In this example one application, article-clone (which could be any application), is shown together with root-clone and the integration-test module. As can be seen article-clone depends on both of these and this means that both of them will build and need to be successful before article-clone build can be done. This also means that integration-test and root-clone can be run in parallel which means that the integration-test build will not add any extra time to the existing builds, prior to integration-test being introduced.

If integration-test fails, however, things will look like this:

![Alt text](doc/build_chain_fail.png?raw=true "Build chain with tests failing")

Observe that integration-test failing has resulted in article-clone, automatically failing (it does not even build), but root-clone was still successfully built. This will effectively prevent article-clone from being deployed as the artifact to be deployed is not properly created.

So assume now that a fix is done and needs to be built and deployed. Now since the integration-test will NOT be able to run against the fix until AFTER it has been built and deployed, the test failure needs to somehow be bypassed. And how to do that, in TeamCity, is by muting test failure(s).
To do this, go to the build, with the test failure in question, and mute it. The two following screenshots illustrate how this can be done:

![Alt text](doc/build_mute_test_1.png?raw=true "Build chain with tests failing")

------>

![Alt text](doc/build_mute_test_2.png?raw=true "Build chain with tests failing")

Then when doing a successive build, with the muted test, it will then be successful and look like this:

![Alt text](doc/build_chain_success_muted.png?raw=true "Build chain with tests muted")

This will allow you to deploy the fix to prod. Remember though to unmute it, using similar procedure, once the fix has been applied so the test  can then be (hopefully) successfuly run.




