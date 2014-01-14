package jobs

import common.{ExecutionContexts, Logging}
import com.amazonaws.services.sqs.AmazonSQSAsyncClient
import conf.Configuration
import com.amazonaws.services.sqs.model.{DeleteMessageBatchRequestEntry, DeleteMessageBatchRequest, ReceiveMessageRequest, GetQueueAttributesRequest}
import com.amazonaws.regions.{Regions, Region}
import scala.collection.JavaConversions._
import services.{S3FrontsApi, FrontPress}
import scala.util.Success
import play.api.libs.json.Json

object FrontPressJob extends ExecutionContexts with Logging {

  val queueUrl: String = ""

  def run() {

  }

}
