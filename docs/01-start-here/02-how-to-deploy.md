# How to deploy

Your pull request is ready, all comments made by reviewers have been addressed and CI results (GitHub Actions) are green.

Congratulations, you can deploy your code to production. Here are the steps to do so:

## Deploying

_The Guardian frontend uses Continuous Deployment – any code pushed to the `main` branch is automatically deployed to production_

1. Merge your pull request to `main`
1. Wait for the tests and build to finish (GitHub Actions)
1. Once the build step is completed, it will be automatically deployed to PROD
1. Prout will send a notification when the deployment has completed
1. Verify that your change works properly

## Blocking deployment

In order to prevent anybody to deploy you can block deployment. To do so, add a [restriction in Riff-Raff](https://riffraff.gutools.co.uk/deployment/restrictions) (Private) for `dotcom:frontend-all` and the stage you want to lock (PROD or .\* for all stages).

Delete the restriction to unblock deploys.

## Frequently asked questions

-   When something goes wrong during deployment, a service cluster might be left in an inconsistent state (i.e. running servers count doesn't match the expected count)
    Developers would need to fix this inconsistency before starting any subsequent deploy – a consistency check is done as the first step of a deploy so all successive deploys will fail until this is resolved.
    To do so, you can modify the expected number of instance for a given Autoscaling group using the AWS console
