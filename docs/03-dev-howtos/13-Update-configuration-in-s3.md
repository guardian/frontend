#Update configuration in s3

We store all our configuration in a single file in `s3`
This contains all the configuration for each application and for each stage.

To add or update a configuration item you need to:
- Download the configuration file
- This is located at
```
https://s3-eu-west-1.amazonaws.com/aws-frontend-store/config/eu-west-1-frontend.conf
```

-- This can be done by hand via the console using the [aws cli tools](http://docs.aws.amazon.com/cli/latest/userguide/installing.html)

-- Find the current version of the config file
```
aws s3 ls --profile=frontend s3://aws-frontend-store/config/
```

look for the most recent version ( the `v3` part )ie:

```
2016-08-30 21:52:58      31386 eu-west-1-frontend.v3.conf
```

-- Create a new copy of the s3 and bump the version number (ie change `v3` to `v4` ).

```
aws s3 cp --profile=frontend s3://aws-frontend-store/config/eu-west-1-frontend.v3.conf s3://aws-frontend-store/config/eu-west-1-frontend.v4.conf
```

--  Download the new file locally:
```
aws s3 cp --profile=frontend s3://aws-frontend-store/config/eu-west-1-frontend.v4.conf .
```

-- Make your changes ....
-- Test them locally by uploading these to s3
```
aws s3 cp --profile=frontend eu-west-1-frontend.v4.conf s3://aws-frontend-store/config/eu-west-1-frontend.v4.conf
```
and bumping the version number `var s3ConfigVersion` in `/common/app/common/configuration.scala`

-- Once you are happy with your changes, create a pull request with the version number changes.

-- Delete the local copy once you have finished
```
rm eu-west-1-frontend.v4.conf
```

-- Once your pull request is merged, everything is done!




