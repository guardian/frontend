package jobs

import com.amazonaws.regions.{Region, Regions}
import com.amazonaws.services.sqs.AmazonSQSAsyncClient
import com.amazonaws.services.sqs.model.ReceiveMessageRequest
import common._
import conf.Configuration
import conf.switches.Switches.R2PagePressServiceSwitch
import org.jsoup.Jsoup
import pagepresser.{PollsHtmlCleaner, BasicHtmlCleaner}
import play.api.libs.json.Json
import play.api.libs.ws.WS
import services.{PagePresses, R2Archive}
import play.api.Play.current

object R2PagePressJob extends ExecutionContexts with Logging {
  val waitTimeSeconds = Configuration.r2Press.pressQueueWaitTimeInSeconds
  val maxMessages = Configuration.r2Press.pressQueueMaxMessages

  val cleaners = Seq(BasicHtmlCleaner, PollsHtmlCleaner)

  val queue: TextMessageQueue[SNSNotification] = (Configuration.r2Press.sqsQueueUrl map { queueUrl =>
    val credentials = Configuration.aws.mandatoryCredentials

    TextMessageQueue[SNSNotification](
      new AmazonSQSAsyncClient(credentials).withRegion(Region.getRegion(Regions.EU_WEST_1)),
      queueUrl
    )
  }) getOrElse {
    throw new RuntimeException("Required property 'r2Press.sqsQueueUrl' not set")
  }

  val takedownQueue: TextMessageQueue[SNSNotification] = (Configuration.r2Press.sqsTakedownQueueUrl map { queueUrl =>
    val credentials = Configuration.aws.mandatoryCredentials

    TextMessageQueue[SNSNotification](
      new AmazonSQSAsyncClient(credentials).withRegion(Region.getRegion(Regions.EU_WEST_1)),
      queueUrl
    )
  }) getOrElse {
    throw new RuntimeException("Required property 'r2Press.sqsTakedownQueueUrl' not set")
  }

  def run() {
    if (R2PagePressServiceSwitch.isSwitchedOn) {
      log.info("R2PagePressJob starting")
      try {
        queue.receive(new ReceiveMessageRequest()
                          .withWaitTimeSeconds(waitTimeSeconds)
                          .withMaxNumberOfMessages(maxMessages)
        ).map ( _ foreach press )

        takedownQueue.receive(new ReceiveMessageRequest()
                                  .withWaitTimeSeconds(waitTimeSeconds)
                                  .withMaxNumberOfMessages(maxMessages)
        ).map ( _ foreach takedown )

      } catch {
        case e: Exception => log.error(s"Failed to decode r2 url: ${e.getMessage}", e)
      }
    } else {
      log.info("R2PagePressJob is switched OFF")
    }
  }

  private def press(message: Message[String]) {
    val urlIn = (Json.parse(message.get) \ "Message").as[String]
    if (urlIn.nonEmpty) {
      WS.url(urlIn).get().map { response =>
        response.status match {
          case 200 => {
            val document = Jsoup.parse(response.body)
            val cleanedHtmlString = cleaners.filter(_.canClean(document))
              .map(_.clean(document))
              .headOption
              .getOrElse(document)
              .toString
            val pressAsUrl = urlIn.replace("https://", "").replace("http://","")

            R2Archive.putPublic(pressAsUrl, cleanedHtmlString, "text/html")
            R2Archive.get(pressAsUrl).foreach { result =>
              if (result == cleanedHtmlString) {
                PagePresses.set(urlIn, pressAsUrl)
                log.info(s"Pressed $urlIn as $pressAsUrl")
              } else {
                log.error(s"Pressed data did not match original for $pressAsUrl")
              }
            }
          }
          case non200 => {
            log.error(s"Unexpected response from $urlIn, status code: $non200")
          }
        }
      }
    } else {
      log.error(s"Invalid url: $urlIn")
    }
    // TODO: only delete if everything is ok?
    queue.delete(message.handle)
  }

  private def takedown(message: Message[String]) {
    val urlIn = (Json.parse(message.get) \ "Message").as[String]
    if (urlIn.nonEmpty) {
      PagePresses.remove(urlIn)
    } else {
      log.error(s"Invalid url: $urlIn")
    }
    // TODO: only delete if everything is ok?
    takedownQueue.delete(message.handle)
  }

}
