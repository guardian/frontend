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
import play.api.libs.json._
import play.api.libs.ws.WS
import services.{S3Archive, S3ArchiveOriginals, PagePresses}
import play.api.Play.current
import model.R2PressMessage
import implicits.R2PressNotification.pressMessageFormatter

object R2PagePressJob extends ExecutionContexts with Logging {
  private val waitTimeSeconds = Configuration.r2Press.pressQueueWaitTimeInSeconds
  private val maxMessages = Configuration.r2Press.pressQueueMaxMessages
  private val credentials = Configuration.aws.mandatoryCredentials

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

  private val queue: JsonMessageQueue[SNSNotification] = (Configuration.r2Press.sqsQueueUrl map { queueUrl =>
    JsonMessageQueue[SNSNotification](
      new AmazonSQSAsyncClient(credentials).withRegion(Region.getRegion(Regions.EU_WEST_1)),
      queueUrl
    )
  }) getOrElse {
    throw new RuntimeException("Required property 'r2Press.sqsQueueUrl' not set")
  }

  private val takedownQueue: TextMessageQueue[SNSNotification] = (Configuration.r2Press.sqsTakedownQueueUrl map { queueUrl =>
    TextMessageQueue[SNSNotification](
      new AmazonSQSAsyncClient(credentials).withRegion(Region.getRegion(Regions.EU_WEST_1)),
      queueUrl
    )
  }) getOrElse {
    throw new RuntimeException("Required property 'r2Press.sqsTakedownQueueUrl' not set")
  }

  private def extractMessage(notification: Message[SNSNotification]): R2PressMessage = {
    Json.parse(notification.get.Message).as[R2PressMessage]
  }

  private def press(notification: Message[SNSNotification]): Unit = {
    val pressMessage = extractMessage(notification)
    if (pressMessage.fromPreservedSrc){
      pressFromOriginalSource(notification)
    } else {
      pressFromLive(notification)
    }
  }

  private def pressAsUrl(urlIn: String): String = urlIn.replace("https://", "").replace("http://","")

  private def parseAndClean(originalDocSource: String): String = {
    val cleaners = Seq(PollsHtmlCleaner, InteractiveHtmlCleaner, SimpleHtmlCleaner)
    val archiveDocument = Jsoup.parse(originalDocSource)
    cleaners.filter(_.canClean(archiveDocument))
      .map(_.clean(archiveDocument))
      .headOption
      .getOrElse(archiveDocument)
      .toString
  }

  private def S3ArchivePutAndCheck(pressUrl: String, cleanedHtml: String) = {
    S3Archive.putPublic(pressUrl, cleanedHtml, "text/html")
    S3Archive.get(pressUrl).exists { result =>
      if (result == cleanedHtml) {
        true
      } else {
        log.error(s"Pressed HTML did not match cleaned HTML for $pressUrl")
        false
      }
    }
  }

  private def pressFromOriginalSource(notification: Message[SNSNotification]) = {
    val message = extractMessage(notification)
    val urlIn = message.url
    val pressUrl = pressAsUrl(urlIn)

    S3ArchiveOriginals.get(pressUrl).foreach { originalSource =>
      log.info(s"Re-pressing $urlIn")

      val cleanedHtmlString = parseAndClean(originalSource)

      S3ArchivePutAndCheck(pressUrl, cleanedHtmlString) match {
        case true => {
          PagePresses.set(urlIn, pressUrl)
          log.info(s"Pressed $urlIn as $pressUrl")
          queue.delete(notification.handle)
        }
        case _ => {
          log.error(s"Press failed for $pressUrl")
        }
      }
    }

  }

  private def pressFromLive(notification: Message[SNSNotification]) {
    val message = extractMessage(notification)
    val urlIn = message.url

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
              val pressUrl = pressAsUrl(urlIn)

              if (S3ArchiveOriginals.get(pressUrl).isEmpty) {
                S3ArchiveOriginals.putPublic(pressUrl, originalSource, "text/html")
                log.info(s"Original page source saved for $urlIn")
              }

              val cleanedHtmlString = parseAndClean(originalSource)

              S3ArchivePutAndCheck(pressUrl, cleanedHtmlString) match {
                case true => {
                  PagePresses.set(urlIn, pressUrl)
                  log.info(s"Pressed $urlIn as $pressUrl")
                  queue.delete(notification.handle)
                }
                case _ => {
                  log.error(s"Press failed for $pressUrl")
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
