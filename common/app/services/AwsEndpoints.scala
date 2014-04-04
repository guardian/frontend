package services

import conf.Configuration.aws
import com.amazonaws.regions.{Regions, Region}
import com.amazonaws.regions.ServiceAbbreviations._
import com.amazonaws.regions.ServiceAbbreviations.{S3 => S3Endpoint}

object AwsEndpoints {
  private lazy val region = Region.getRegion(Regions.fromName(aws.region))

  lazy val sns: String = region.getServiceEndpoint(SNS)
  lazy val elb: String = region.getServiceEndpoint(ElasticLoadbalancing)
  lazy val monitoring: String = region.getServiceEndpoint(CloudWatch)
  lazy val dynamoDb: String = region.getServiceEndpoint(Dynamodb)
  lazy val s3: String = region.getServiceEndpoint(S3Endpoint)
}
