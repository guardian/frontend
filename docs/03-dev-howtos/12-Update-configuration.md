# Update configuration in Systems Manager Parameter Store

We store all our configuration in Systems Manager Parameter Store.

An app will attempt to load properties from the following levels in Systems
Manger Parameter Store: 

```
/frontend/{stage}/{app}/config.property.name
/frontend/{stage}/config.property.name
/frontend/config.property.name
```

Configuration can be shared at the root and stage levels.

The easiest way to add or modify configuration properties is via the AWS console.

To add or update a configuration item you need to:

- Login to Frontend AWS console via [Janus](https://janus.gutools.co.uk)

Nativgate to [Systems Manager Parameter Store](https://eu-west-1.console.aws.amazon.com/ec2/v2/home?region=eu-west-1#Parameters:sort=Name)
and use the console UI to edit the config.
