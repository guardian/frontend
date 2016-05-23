package fronts

import com.amazonaws.services.s3.AmazonS3Client
import com.gu.facia.client.{AmazonSdkS3Client, ApiClient}
import common.ExecutionContexts
import conf.Configuration
import services.AwsEndpoints

object FrontsApi extends ExecutionContexts {
  val amazonClient: ApiClient = {
    val client = new AmazonS3Client(Configuration.aws.mandatoryCredentials)
    client.setEndpoint(AwsEndpoints.s3)
    ApiClient(Configuration.aws.bucket, Configuration.facia.stage.toUpperCase, AmazonSdkS3Client(client))
  }

  lazy val crossAccountClient: ApiClient = {
    val client = new AmazonS3Client(Configuration.faciatool.crossAccountMandatoryCredentials)
    client.setEndpoint(AwsEndpoints.s3)
    ApiClient(Configuration.faciatool.crossAccountSourceBucket, Configuration.facia.stage.toUpperCase, AmazonSdkS3Client(client))
  }
}
