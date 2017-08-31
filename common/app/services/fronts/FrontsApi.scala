package services.fronts

import com.amazonaws.services.s3.{AmazonS3, AmazonS3Client}
import com.gu.facia.client.{AmazonSdkS3Client, ApiClient}
import common.ExecutionContexts
import conf.Configuration

object FrontsApi extends ExecutionContexts {

  def crossAccountClient: ApiClient = {
    val client: AmazonS3 = AmazonS3Client
      .builder
      .withCredentials(Configuration.faciatool.crossAccountMandatoryCredentials)
      .withRegion(conf.Configuration.aws.region)
      .build()
    ApiClient(Configuration.faciatool.crossAccountSourceBucket, Configuration.facia.stage.toUpperCase, AmazonSdkS3Client(client))
  }
}
