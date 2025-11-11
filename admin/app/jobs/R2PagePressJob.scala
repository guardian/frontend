package jobs

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
import software.amazon.awssdk.services.sqs.SqsAsyncClient
import software.amazon.awssdk.services.sqs.model.ReceiveMessageRequest
import utils.AWSv2

import scala.concurrent.{ExecutionContext, Future}

class R2PagePressJob(wsClient: WSClient, redirects: RedirectService)(implicit executionContext: ExecutionContext)
    extends GuLogging {
  private lazy val waitTimeSeconds = Configuration.r2Press.pressQueueWaitTimeInSeconds
  private lazy val maxMessages = Configuration.r2Press.pressQueueMaxMessages
  private lazy val credentials = Configuration.aws.mandatoryCredentials
  private lazy val sqsClient =
    SqsAsyncClient
      .builder()
      .credentialsProvider(AWSv2.credentials)
      .region(AWSv2.region)
      .build()

  def run(): Future[Unit] = {
    if (R2PagePressServiceSwitch.isSwitchedOn) {
      log.info("R2PagePressJob starting")

      val receiveRequest = ReceiveMessageRequest
        .builder()
        .waitTimeSeconds(waitTimeSeconds)
        .maxNumberOfMessages(maxMessages)
        .build()

      try {
        val pressing = queue
          .receive(receiveRequest)
          .flatMap(messages => Future.sequence(messages map pressFromOriginalSource).map(_ => ()))

        val takingDown = takedownQueue
          .receive(receiveRequest)
          .flatMap(messages => Future.sequence(messages map takedown).map(_ => ()))

        Future.sequence(Seq(pressing, takingDown)).map(_ => ())
      } catch {
        case e: Exception =>
          log.error(s"Failed to decode r2 url: ${e.getMessage}", e)
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
      queueUrl,
    )
  }) getOrElse {
    throw new RuntimeException("Required property 'r2Press.sqsQueueUrl' not set")
  }

  private lazy val takedownQueue: TextMessageQueue[SNSNotification] =
    (Configuration.r2Press.sqsTakedownQueueUrl map { queueUrl =>
      TextMessageQueue[SNSNotification](
        sqsClient,
        queueUrl,
      )
    }) getOrElse {
      throw new RuntimeException("Required property 'r2Press.sqsTakedownQueueUrl' not set")
    }

  private def stripProtocol(url: String): String =
    url
      .replace("https://", "")
      .replace("http://", "")

  private def parseAndClean(originalDocSource: String, convertToHttps: Boolean): Future[String] = {
    val cleaners =
      Seq(new PollsHtmlCleaner(wsClient), InteractiveHtmlCleaner, NextGenInteractiveHtmlCleaner, SimpleHtmlCleaner)
    val archiveDocument = Jsoup.parse(originalDocSource)
    val doc: Document = cleaners
      .find(_.canClean(archiveDocument))
      .map(_.clean(archiveDocument, convertToHttps))
      .getOrElse(archiveDocument)
    Future.successful(doc.toString)
  }

  private def S3ArchivePutAndCheck(pressUrl: String, cleanedHtml: String) = {
    S3Archive.putPublic(pressUrl, cleanedHtml, "text/html")
    S3Archive.get(pressUrl).exists { result =>
      val identical = result == cleanedHtml
      if (identical) {
        log.error(s"Pressed HTML did not match cleaned HTML for $pressUrl")
      }

      identical
    }
  }

  private def pressFromOriginalSource(notification: Message[SNSNotification]): Future[Unit] = {
    val message = Json.parse(notification.get.Message).as[R2PressMessage]
    val urlIn = message.url
    val pressUrl = stripProtocol(urlIn)

    S3ArchiveOriginals
      .get(pressUrl)
      .map { originalSource =>
        log.info(s"Re-pressing $urlIn")

        val cleanedHtmlString = parseAndClean(originalSource, message.convertToHttps)

        cleanedHtmlString
          .map { cleanedHtmlString =>
            S3ArchivePutAndCheck(pressUrl, cleanedHtmlString) match {
              case true =>
                redirects.set(ArchiveRedirect(urlIn, pressUrl))
                log.info(s"Pressed $urlIn as $pressUrl")
                queue.delete(notification.handle)
              case _ => log.error(s"Press failed for $pressUrl")
            }
          }
          .map(_ => ())
      }
      .getOrElse(Future.successful(()))
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
      case e: Exception =>
        log.error(s"Cannot take down $urlIn: ${e.getMessage}")
        Future.failed(new RuntimeException(s"Cannot take down $urlIn", e))
    }
  }
}
