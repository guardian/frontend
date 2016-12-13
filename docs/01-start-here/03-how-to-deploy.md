# How to deploy

Your pull request is ready, all comments made by reviewers have been addressed and CI results (Teamcity) are green.
Congratulations, you can deploy your code to production. Here are the steps to do so:

##Deploying

1. Merge your pull request to master
2. Wait for the tests and the build to finish (Teamcity)
3. Once the build is done, it will be automatically deployed to CODE (The Guardian staging environment)
4. Verify that your change works properly on CODE
5. You can find out who is also currently deploying by using the [Deploy Radiator](https://frontend.gutools.co.uk/deploys-radiator) (Private)
6. If several people are pushing to PROD at the same time, please coordinate with each other. Slack channel #dotcom-push is a good place to do so.
7. When ready use [Riff-Raff to deploy](https://riffraff.gutools.co.uk/deployment/request) (Private) the `dotcom:all` artifact to production. The build to deploy can be found in Teamcity ([example](images/build-number-tc.png)) or on the [Deploy Radiator](https://frontend.gutools.co.uk/deploys-radiator) (Private)
8. Verify that your changes are working in production and check the [logs](https://kibana.gu-web.net/goto/7c4f5f1b8b3c0b49055b3611d5d7810e) (Private) for any issue related to the deployment.


##Blocking deployment

In order to prevent anybody to deploy you can block deployment. To do so, add a [restriction in Riff-Raff](https://riffraff.gutools.co.uk/deployment/restrictions) (Private) for `dotcom:all` and the stage you want to lock (PROD or .* for all stages).

Delete the restriction to unblock deploys.

##  Frequently asked questions

- When something goes wrong during deployment, a service cluster might be left in an inconsistent state (ie: running servers count doesn't match the expected count)
Developers would need to fix this inconsistency before to start any subsequent deploy (a consistency check is done as the first step of a deploy so all successive deploys will fail until this is resolved).
To do so, you can modify the expected number of instance for a given Autoscaling group using the AWS console or `goo` tool (ex: `./goo groups update AUTOSCALING-GROUP-ID 3 3 12`)

