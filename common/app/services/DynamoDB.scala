package services

import com.amazonaws.AmazonWebServiceClient
import com.amazonaws.auth.AWSCredentialsProvider
import com.amazonaws.regions.{Region, Regions}
import com.amazonaws.services.dynamodbv2.{AmazonDynamoDBAsyncClient, AmazonDynamoDBClient}
import conf.Configuration


object DynamoDB {
  private lazy val credentials = Configuration.aws.mandatoryCredentials
  private lazy val region = Region.getRegion(Regions.fromName(Configuration.aws.region))

  lazy val asyncClient = createClient(classOf[AmazonDynamoDBAsyncClient])
  lazy val syncClient = createClient(classOf[AmazonDynamoDBClient])

  private def createClient[T <: AmazonWebServiceClient](serviceClass: Class[T]): T = {
    val client = serviceClass
      .getConstructor(classOf[AWSCredentialsProvider])
      .newInstance(credentials)
    client.setRegion(region)
    client
  }
}
