# Updating configuration

Application config is stored in `app-config`.

Global configuration shared by difference stages is stored in `app-config/shared/global`

App configuration overrides are stored in `app-config/overrides/{app-name}.`

Configuration files can point to versions of config properties stored in parameter store in the format
`param-store@{parameter store key}`

Parameter store keys are of the following format

```
/frontend/{stage}/{app}/{property name}.v{version}
/frontend/{stage}/{property name}.v{version}
/frontend/{property name}.v{version}
```

Configuration is shared at the global and stage levels.

#### Editing / Adding configuration means:

Adding the configuration to the necessary conf files.

If the property is sensitive information, the conf value should point to a Parameter Store property.

Do not edit Parameter Store properties. Instead create a new property and increment the version on the property name.

The easiest way to add configuration properties is via the AWS console.

To add a configuration item you need to:

- Login to Frontend AWS console via [Janus](https://janus.gutools.co.uk)

Nativgate to [Systems Manager Parameter Store](https://eu-west-1.console.aws.amazon.com/ec2/v2/home?region=eu-west-1#Parameters:sort=Name)
and use the console UI to add a config property.


#### Why do configuration this way?

- GDPR requirements. Apps only load the configuration they require dependent on the stage.
- We want configuration properties to be immutable and dependent on the git commits / releases.
This allows us to rollback configuration properties via deployments.
- Parameter store performance. It takes 10-15ms on average to load a single property (even with batching).
Therefore we only want to download the specific version of a property that an app requires.
- Local overrides. We don't want to apply versioning within property names since this will 
interfere with local overrides.
- Potential for storing non-sensitive, stage-specific configuration locally within the frontend repo.
