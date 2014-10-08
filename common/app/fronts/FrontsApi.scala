package fronts

import com.amazonaws.services.s3.AmazonS3Client
import com.gu.facia.client.{AmazonSdkS3Client, ApiClient}
import common.ExecutionContexts
import conf.Configuration
import services.AwsEndpoints

object FrontsApi extends ExecutionContexts {
  val amazonClient: ApiClient = {
    val client = new AmazonS3Client(Configuration.aws.credentials.get)
    client.setEndpoint(AwsEndpoints.s3)
    ApiClient("aws-frontend-store", Configuration.facia.stage, AmazonSdkS3Client(client))
  }
}
