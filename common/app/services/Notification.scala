package services

import com.amazonaws.services.sns.{AmazonSNSAsync, AmazonSNSAsyncClient}
import com.amazonaws.services.sns.model.PublishRequest
import common.{PekkoAsync, GuLogging}
import conf.Configuration
import awswrappers.sns._

import scala.concurrent.ExecutionContext
import scala.util.{Failure, Success}

trait Notification extends GuLogging {

  val topic: String

  lazy val sns: Option[AmazonSNSAsync] = Configuration.aws.credentials.map { credentials =>
    AmazonSNSAsyncClient
      .asyncBuilder()
      .withCredentials(credentials)
      .withRegion(conf.Configuration.aws.region)
      .build()
  }

  def send(
      pekkoAsync: PekkoAsync,
  )(subject: String, message: String)(implicit executionContext: ExecutionContext): Unit = {
    val request = new PublishRequest()
      .withTopicArn(topic)
      .withSubject(subject)
      .withMessage(message)

    sendAsync(pekkoAsync)(request)
  }

  def sendWithoutSubject(pekkoAsync: PekkoAsync)(message: String)(implicit executionContext: ExecutionContext): Unit = {
    val request = new PublishRequest()
      .withTopicArn(topic)
      .withMessage(message)

    sendAsync(pekkoAsync)(request)
  }

  private def sendAsync(
      pekkoAsync: PekkoAsync,
  )(request: PublishRequest)(implicit executionContext: ExecutionContext): Unit =
    pekkoAsync.after1s {
      sns match {
        case Some(client) =>
          log.info(s"Issuing SNS notification: ${request.getSubject}:${request.getMessage}")
          client.publishFuture(request) onComplete {
            case Success(_) =>
              log.info(s"Successfully published SNS notification: ${request.getSubject}:${request.getMessage}")

            case Failure(error) =>
              log.error(s"Failed to publish SNS notification: ${request.getSubject}:${request.getMessage}", error)
          }
        case None =>
          log.error(s"There is NO SNS client available to publish ${request.getSubject}:${request.getMessage}")
      }
    }
}

object FrontPressNotification extends Notification {
  lazy val topic: String = Configuration.aws.frontPressSns.getOrElse("")
}

object R2PressNotification extends Notification {
  lazy val topic: String = Configuration.aws.r2PressSns.getOrElse("")
}

object R2PressedPageTakedownNotification extends Notification {
  lazy val topic: String = Configuration.aws.r2PressTakedownSns.getOrElse("")
}
