package services.fronts

import com.gu.etagcaching.aws.sdkv2.s3.S3ObjectFetching
import com.gu.facia.client.{ApiClient, Environment}
import conf.Configuration
import utils.AWSv2.buildS3AsyncClient

import scala.concurrent.ExecutionContext

object FrontsApi {

  def crossAccountClient(implicit ec: ExecutionContext): ApiClient = ApiClient.withCaching(
    Configuration.faciatool.crossAccountSourceBucket,
    Environment(Configuration.facia.stage.toUpperCase),
    S3ObjectFetching.byteArraysWith(buildS3AsyncClient(Configuration.faciatool.crossAccountMandatoryCredentials)),
  )
}
