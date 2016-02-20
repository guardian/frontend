package jobs

import com.amazonaws.regions.{Region, Regions}
import com.amazonaws.services.sqs.AmazonSQSAsyncClient
import com.amazonaws.services.sqs.model.ReceiveMessageRequest
import common._
import conf.Configuration
import conf.switches.Switches.R2PagePressServiceSwitch
import conf.switches.Switches.R2HeadersRequiredForPagePressingSwitch
import org.jsoup.Jsoup
import pagepresser.{SimpleHtmlCleaner, InteractiveHtmlCleaner, PollsHtmlCleaner}
import play.api.libs.json.Json
import play.api.libs.ws.WS
import services.{S3Archive, S3ArchiveOriginals, PagePresses}
import play.api.Play.current

object R2PagePressJob extends ExecutionContexts with Logging {
  val waitTimeSeconds = Configuration.r2Press.pressQueueWaitTimeInSeconds
  val maxMessages = Configuration.r2Press.pressQueueMaxMessages

  val cleaners = Seq(PollsHtmlCleaner, InteractiveHtmlCleaner, SimpleHtmlCleaner)

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
      val r2HeaderName = Configuration.r2Press.header.name.getOrElse("")
      val r2HeaderValue = Configuration.r2Press.header.value.getOrElse("")

      val wSRequest = if(R2HeadersRequiredForPagePressingSwitch.isSwitchedOn) WS.url(urlIn).withHeaders((r2HeaderName, r2HeaderValue))
                      else WS.url(urlIn)

      wSRequest.get().map { response =>
        response.status match {
          case 200 => {
            try {
              val originalSource = response.body
              val pressAsUrl = urlIn.replace("https://", "").replace("http://","")

              if (S3ArchiveOriginals.get(pressAsUrl).isEmpty) {
                S3ArchiveOriginals.putPublic(pressAsUrl, originalSource, "text/html")
                log.info(s"Original page source saved for $urlIn")
              }

              val archiveDocument = Jsoup.parse(originalSource)

              val cleanedHtmlString = cleaners.filter(_.canClean(archiveDocument))
                .map(_.clean(archiveDocument))
                .headOption
                .getOrElse(archiveDocument)
                .toString

              S3Archive.putPublic(pressAsUrl, cleanedHtmlString, "text/html")

              S3Archive.get(pressAsUrl).foreach { result =>
                if (result == cleanedHtmlString) {
                  PagePresses.set(urlIn, pressAsUrl)
                  log.info(s"Pressed $urlIn as $pressAsUrl")
                  queue.delete(message.handle)
                } else {
                  log.error(s"Pressed HTML did not match cleaned HTML for $pressAsUrl")
                }
              }
            } catch {
              case e: Exception => log.error(s"Unable to press $urlIn (${e.getMessage})", e)
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
  }

  private def takedown(message: Message[String]) {
    val urlIn = (Json.parse(message.get) \ "Message").as[String]
    try {
      if (urlIn.nonEmpty) {
        PagePresses.remove(urlIn)
        takedownQueue.delete(message.handle)
      } else {
        log.error(s"Invalid url: $urlIn")
      }
    } catch {
      case e: Exception => log.error(s"Cannot take down $urlIn: ${e.getMessage}")
    }
  }

}
