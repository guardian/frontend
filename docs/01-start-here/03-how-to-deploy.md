# How to deploy

Your pull request is ready, all comments made by reviewers have been addressed and CI results (Teamcity) are green.
Congratulations, you can deploy your code to production. Here are the steps to do so:

##Deploying

1. Merge your pull request to master
2. Wait for the tests and the build to finish (Teamcity)
3. Once the build is done, it will be automatically deployed to CODE (The Guardian staging environment)
4. Verify that your change works properly on CODE
5. You can find out who is also currently deploying by using the [Deploy Radiator](https://frontend.gutools.co.uk/deploys-radiator) (Private)
6. If several people are pushing to PROD at the same time, please coordinates with each other. Slack channel #dotcom-push is a good place to do so.
7. When ready use `goo` tool to deploy the build to production. (ex: `./goo deploy --prod -b BUILD_NUMBER` and then confirm). You will need valid AWS credentials. Please use [Janus](https://janus.gutools.co.uk/#) to obtain them. The `BUILD_NUMBER` can be found in Teamcity ([example](images/build-number-tc.png))
8. Wait for all the services to be deployed. You can follow the advancement using [Riff-Raff](https://riffraff.gutools.co.uk/) (Private)
9. Verify that your changes are working in production and check the [logs](https://kibana.gu-web.net/goto/7c4f5f1b8b3c0b49055b3611d5d7810e) (Private) for any issue related to the deployment.


##Blocking deployment

In order to prevent anybody to deploy you can lock deployment. To do so, use the `goo` tool:
`./goo deploy block`

Use `./goo deploy unblock` to unblock deployment

##  Frequently asked questions

- Where is the `goo` tool?
`goo` is available in The Guardian platform [repo](https://github.com/guardian/platform/) (Private)

- When something goes wrong during deployment, a service cluster might be left in an inconsistent state (ie: running servers count doesn't match the expected count)
Developers would need to fix this inconsistency before to start any subsequent deploy.
To do so, you can modify the expected number of instance for a given Autoscaling group using the AWS console or `goo` tool (ex: `./goo groups update AUTOSCALING-GROUP-ID 3 3 12`)

