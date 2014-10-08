package fronts

import com.amazonaws.services.s3.AmazonS3Client
import com.gu.facia.client.{AmazonSdkS3Client, ApiClient}
import common.ExecutionContexts
import conf.Configuration

object FrontsApi extends ExecutionContexts {
  val amazonClient: ApiClient =
    ApiClient("aws-frontend-store", Configuration.facia.stage, AmazonSdkS3Client(new AmazonS3Client(Configuration.aws.credentials.get)))
}
