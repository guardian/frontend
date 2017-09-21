package jobs

import com.amazonaws.services.sqs.AmazonSQSAsyncClient
import com.amazonaws.services.sqs.model.ReceiveMessageRequest
import common._
import conf.Configuration
import conf.switches.Switches.R2PagePressServiceSwitch
import org.jsoup.Jsoup
import pagepresser.{InteractiveHtmlCleaner, NextGenInteractiveHtmlCleaner, PollsHtmlCleaner, SimpleHtmlCleaner}
import play.api.libs.json._
import play.api.libs.ws.WSClient
import services.{RedirectService, S3Archive, S3ArchiveOriginals}
import model.R2PressMessage
import implicits.R2PressNotification.pressMessageFormatter
import org.jsoup.nodes.Document
import services.RedirectService.ArchiveRedirect

import scala.concurrent.{ExecutionContext, Future}

class R2PagePressJob(wsClient: WSClient, redirects: RedirectService)(implicit executionContext: ExecutionContext) extends Logging {
  private lazy val waitTimeSeconds = Configuration.r2Press.pressQueueWaitTimeInSeconds
  private lazy val maxMessages = Configuration.r2Press.pressQueueMaxMessages
  private lazy val credentials = Configuration.aws.mandatoryCredentials
  private lazy val sqsClient = AmazonSQSAsyncClient.asyncBuilder.withCredentials(credentials).withRegion(conf.Configuration.aws.region).build()

  def run(): Future[Unit] = {
    if (R2PagePressServiceSwitch.isSwitchedOn) {
      log.info("R2PagePressJob starting")
      try {
        val pressing = queue.receive(new ReceiveMessageRequest()
          .withWaitTimeSeconds(waitTimeSeconds)
          .withMaxNumberOfMessages(maxMessages)
        ).flatMap( messages => Future.sequence(messages map press).map(_ => ()) )

        val takingDown = takedownQueue.receive(new ReceiveMessageRequest()
          .withWaitTimeSeconds(waitTimeSeconds)
          .withMaxNumberOfMessages(maxMessages)
        ).map ( messages => Future.sequence(messages map takedown).map(_ => ()) )

        Future.sequence(Seq(pressing, takingDown)).map(_ => ())
      } catch {
        case e: Exception => log.error(s"Failed to decode r2 url: ${e.getMessage}", e)
          Future.failed(new RuntimeException(s"Failed to decode r2 url: ${e.getMessage}", e))
      }
    } else {
      log.info("R2PagePressJob is switched OFF")
      Future.successful(())
    }
  }

  private lazy val queue: JsonMessageQueue[SNSNotification] = (Configuration.r2Press.sqsQueueUrl map { queueUrl =>
    JsonMessageQueue[SNSNotification](
      sqsClient,
      queueUrl
    )
  }) getOrElse {
    throw new RuntimeException("Required property 'r2Press.sqsQueueUrl' not set")
  }

  private lazy val takedownQueue: TextMessageQueue[SNSNotification] = (Configuration.r2Press.sqsTakedownQueueUrl map { queueUrl =>
    TextMessageQueue[SNSNotification](
      sqsClient,
      queueUrl
    )
  }) getOrElse {
    throw new RuntimeException("Required property 'r2Press.sqsTakedownQueueUrl' not set")
  }

  private def extractMessage(notification: Message[SNSNotification]): R2PressMessage = {
    Json.parse(notification.get.Message).as[R2PressMessage]
  }

  private def press(notification: Message[SNSNotification]): Future[Unit] = {
    val pressMessage = extractMessage(notification)
    if (pressMessage.fromPreservedSrc){
      pressFromOriginalSource(notification)
    } else {
      pressFromLive(notification)
    }
  }

  private def pressAsUrl(urlIn: String): String = urlIn.replace("https://", "").replace("http://","")

  private def parseAndClean(originalDocSource: String, convertToHttps: Boolean): Future[String] = {
    val cleaners = Seq(new PollsHtmlCleaner(wsClient), InteractiveHtmlCleaner, NextGenInteractiveHtmlCleaner, SimpleHtmlCleaner)
    val archiveDocument = Jsoup.parse(originalDocSource)
    val doc: Document = cleaners.find(_.canClean(archiveDocument))
                        .map(_.clean(archiveDocument, convertToHttps))
                        .getOrElse(archiveDocument)
    Future.successful(doc.toString)
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

  private def pressFromOriginalSource(notification: Message[SNSNotification]): Future[Unit] = {
    val message = extractMessage(notification)
    val urlIn = message.url
    val pressUrl = pressAsUrl(urlIn)

    S3ArchiveOriginals.get(pressUrl).map { originalSource =>
      log.info(s"Re-pressing $urlIn")

      val cleanedHtmlString = parseAndClean(originalSource, message.convertToHttps)

      cleanedHtmlString.map { cleanedHtmlString =>
        S3ArchivePutAndCheck(pressUrl, cleanedHtmlString) match {
          case true =>
            redirects.set(ArchiveRedirect(urlIn, pressUrl))
            log.info(s"Pressed $urlIn as $pressUrl")
            queue.delete(notification.handle)
          case _ => log.error(s"Press failed for $pressUrl")
        }
      }.map(_ => ())
    }.getOrElse(Future.successful(()))

  }

  private def pressFromLive(notification: Message[SNSNotification]): Future[Unit] = {
    val message = extractMessage(notification)
    val urlIn = message.url

    if (urlIn.nonEmpty) {

      val wsRequest = wsClient.url(urlIn)

      log.info(s"Calling ${wsRequest.uri}")

      wsRequest.get().flatMap { response =>
        response.status match {
          case 200 =>
            try {
              val originalSource = response.body
              val pressUrl = pressAsUrl(urlIn)

              if (S3ArchiveOriginals.get(pressUrl).isEmpty) {
                S3ArchiveOriginals.putPublic(pressUrl, originalSource, "text/html")
                log.info(s"Original page source saved for $urlIn")
              }

              val cleanedHtmlString = parseAndClean(originalSource, message.convertToHttps)

              cleanedHtmlString.map { cleanedHtmlString =>
                S3ArchivePutAndCheck(pressUrl, cleanedHtmlString) match {
                  case true =>
                    redirects.set(ArchiveRedirect(urlIn, pressUrl))
                    log.info(s"Pressed $urlIn as $pressUrl")
                    queue.delete(notification.handle)
                  case _ => log.error(s"Press failed for $pressUrl")
                }
              }
            } catch {
              case e: Exception => log.error(s"Unable to press $urlIn (${e.getMessage})", e)
                Future.failed(new RuntimeException(s"Unable to press $urlIn (${e.getMessage})", e))
            }
          case non200 =>
            log.error(s"Unexpected response from ${wsRequest.uri}, status code: $non200")
            Future.failed(new RuntimeException(s"Unexpected response from ${wsRequest.uri}, status code: $non200"))
        }
      }
    } else {
      log.error(s"Invalid url: $urlIn")
      Future.failed(new RuntimeException(s"Invalid url: $urlIn"))
    }
  }

  private def takedown(message: Message[String]): Future[Unit] = {
    val urlIn = (Json.parse(message.get) \ "Message").as[String]
    try {
      if (urlIn.nonEmpty) {
        redirects.remove(urlIn)
        takedownQueue.delete(message.handle)
      } else {
        log.error(s"Invalid url: $urlIn")
        Future.failed(new RuntimeException(s"Invalid url: $urlIn"))
      }
    } catch {
      case e: Exception => log.error(s"Cannot take down $urlIn: ${e.getMessage}")
        Future.failed(new RuntimeException(s"Cannot take down $urlIn", e))
    }
  }

}
