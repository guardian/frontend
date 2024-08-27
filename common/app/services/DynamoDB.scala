package services

import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.dynamodb.{DynamoDbAsyncClient, DynamoDbClient}
import utils.AWSv2

object DynamoDB {

  lazy val asyncClient: DynamoDbAsyncClient = DynamoDbAsyncClient
    .builder()
    .credentialsProvider(AWSv2.credentials)
    .region(Region.of(conf.Configuration.aws.region))
    .build()

  lazy val syncClient: DynamoDbClient = DynamoDbClient
    .builder()
    .credentialsProvider(AWSv2.credentials)
    .region(Region.of(conf.Configuration.aws.region))
    .build()
}
