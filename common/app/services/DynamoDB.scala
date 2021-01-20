package services

import com.amazonaws.regions.{Region, Regions}
import com.amazonaws.services.dynamodbv2.{
  AmazonDynamoDB,
  AmazonDynamoDBAsync,
  AmazonDynamoDBAsyncClient,
  AmazonDynamoDBClient,
}
import conf.Configuration

object DynamoDB {
  private lazy val credentials = Configuration.aws.mandatoryCredentials
  private lazy val region = Region.getRegion(Regions.fromName(Configuration.aws.region))

  lazy val asyncClient: AmazonDynamoDBAsync = AmazonDynamoDBAsyncClient
    .asyncBuilder()
    .withCredentials(credentials)
    .withRegion(conf.Configuration.aws.region)
    .build()

  lazy val syncClient: AmazonDynamoDB = AmazonDynamoDBClient
    .builder()
    .withCredentials(credentials)
    .withRegion(conf.Configuration.aws.region)
    .build()
}
