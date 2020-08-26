package services.fronts

import com.amazonaws.services.s3.{AmazonS3, AmazonS3Client}
import com.gu.facia.client.{AmazonSdkS3Client, ApiClient}
import conf.Configuration
import scala.concurrent.ExecutionContext

object FrontsApi {

  def crossAccountClient(implicit ec: ExecutionContext): ApiClient = {
    val client: AmazonS3 = AmazonS3Client.builder
      .withCredentials(Configuration.faciatool.crossAccountMandatoryCredentials)
      .withRegion(conf.Configuration.aws.region)
      .build()
    ApiClient(
      Configuration.faciatool.crossAccountSourceBucket,
      Configuration.facia.stage.toUpperCase,
      AmazonSdkS3Client(client),
    )
  }
}
