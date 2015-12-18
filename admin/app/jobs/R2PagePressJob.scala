package jobs

import com.amazonaws.regions.{Region, Regions}
import com.amazonaws.services.sqs.AmazonSQSAsyncClient
import com.amazonaws.services.sqs.model.ReceiveMessageRequest
import common._
import conf.Configuration
import conf.switches.Switches.R2PagePressServiceSwitch
import play.api.libs.json.{JsLookupResult, JsDefined, Json}

object R2PagePressJob extends ExecutionContexts with Logging {
  val waitTimeSeconds = 20

  val queue: TextMessageQueue[SNSNotification] = (Configuration.r2Press.sqsQueueUrl map { queueUrl =>
    val credentials = Configuration.aws.mandatoryCredentials

    TextMessageQueue[SNSNotification](
      new AmazonSQSAsyncClient(credentials).withRegion(Region.getRegion(Regions.EU_WEST_1)),
      queueUrl
    )
  }) getOrElse {
    throw new RuntimeException("Required property 'r2Press.sqsQueueUrl' not set")
  }

  def run() {
    if (R2PagePressServiceSwitch.isSwitchedOn) {
      log.info("R2PagePressJob: run")
      try {
        queue.receive(new ReceiveMessageRequest().withWaitTimeSeconds(waitTimeSeconds)) map { messages =>
          messages foreach { message =>
            val url = (Json.parse(message.get) \ "Message").as[String]
            //TODO - Send the URL to the fetcher & cleaner
            //TODO - Send the cleaned HTML to S3
            //TODO - Update the redirects DynamoDB table
            queue.delete(message.handle)
          }
        }
        log.info("R2PagePressJob: finished")
      } catch {
        case e: Exception => log.error(s"Failed to decode r2 url: ${e.getMessage}", e)
      }
    } else {
      log.info("R2PagePressJob is switched OFF")
    }
  }
}
