package services

import com.gu.facia.client.{ApiClient, AmazonSdkS3Client}
import common.ExecutionContexts
import conf.Configuration

object FaciaJsonClient extends ExecutionContexts {
  val client = ApiClient(Configuration.aws.bucket, Configuration.facia.stage, AmazonSdkS3Client.default)
}
