package services

import com.gu.facia.client.{ApiClient, AmazonSdkS3Client}
import conf.Configuration

object FaciaJsonClient {
  import scala.concurrent.ExecutionContext.Implicits.global
  val client = ApiClient(Configuration.aws.bucket, Configuration.facia.stage, AmazonSdkS3Client.default)
}
