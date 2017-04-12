# Update configuration in s3

We store all our configuration in a single file in `s3`
This contains all the configuration for each application and for each stage.

To add or update a configuration item you need to:

- Get valid [Janus](https://janus.gutools.co.uk) credentials for frontend

- Find the current version of the config file
```
aws s3 ls --profile=frontend s3://aws-frontend-store/config/
```

look for the most recent version ( the `v22` part ):

```
2016-08-30 21:52:58      31386 eu-west-1-frontend.v22.conf
```

- Create a new copy of the s3 and bump the version number (change `v22` to `v23` ).

```
aws s3 cp --profile=frontend s3://aws-frontend-store/config/eu-west-1-frontend.v22.conf s3://aws-frontend-store/config/eu-west-1-frontend.v23.conf
```

-  Download the new file locally:
```
aws s3 cp --profile=frontend s3://aws-frontend-store/config/eu-west-1-frontend.v23.conf .
```

- Make your changes ....
-- Test them locally by uploading these to s3
```
aws s3 cp --profile=frontend eu-west-1-frontend.v23.conf s3://aws-frontend-store/config/eu-west-1-frontend.v23.conf
```
and bump the version number `var s3ConfigVersion` in [/common/app/common/configuration.scala](https://github.com/guardian/frontend/blob/master/common/app/common/configuration.scala) to match the version of the config file you created.

- Once you are happy with your changes, create a pull request with the version number changes.

- Delete the local copy once you have finished
```
rm eu-west-1-frontend.v23.conf
```

- Once your pull request is merged, everything is done!




