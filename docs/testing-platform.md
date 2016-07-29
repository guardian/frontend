# Testing AMIs or provisioning in AWS

Sometimes you want to mess around testing something complex (untestable locally e.g. AMI or config changes) in a real env, but you don't want to block the CODE/PROD deployment path.

The simplest way to do that is to spin up a new Auto scaling Group in environment TEST, and deploy your build there.

## deploy your stuff for testing
1. build your branch of platform/your ami/whatever it is you plan to test.  If you want to test frontend itself, we don't produce artifacts for a PR build.  See below for some pointers.
1. deploy platform to stage TEST
1. deploy a build of frontend to TEST if necessary (this will copy the file but won't be able to find the ASG)

## create the launch config
1. go to the appropriate launch configuration in AWS EC2 console as admin/cloudformation e.g. frontend-CODE-ArticleServer-1P6YIUG2KIZWB
1. Copy it, and give it a good name e.g. john-test-article-launch
1. edit the "details" and open the advanced details.
1. change `export FACTER_gu_stage='CODE'` to refer to TEST stage instead
1. change whatever else you want - e.g. AMI
1. make sure it's still in the GuardianAccess and ApplicationServer security groups (under non-vpc)
1. create the launch configuration /Note: it's worth using your own key, especially if you are changing puppet provisioning, as otherwise you can't log in and look when puppet inevitably fails the first time/

## Next create an ASG
1. click the Create an ASG with this launch configuration button
1. call it john-test-article-asg or similar
1. give it an availability zone (you probably don't need a load balancer)
1. make sure it has 1 instance

## Getting rid of it after use
1. delete the ASG and Launch config

## Building a branch with frontend
1. copy the dotcom:frontend master build in teamcity and give it a name e.g. john-test-frontend
1. change the branch in the git definition
1. make sure you select copy the git definition rather than editing the master one
1. run the build - it will create the build under build id 1
1. deploy build 1 with riffraff to TEST
1. delete the build definition/git definition again

