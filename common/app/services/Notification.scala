package services

import common.{GuLogging, PekkoAsync}
import conf.Configuration
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.sns.SnsAsyncClient
import software.amazon.awssdk.services.sns.model.PublishRequest
import utils.AWSv2

import scala.concurrent.ExecutionContext
import scala.util.{Failure, Success}
import scala.jdk.FutureConverters._

trait Notification extends GuLogging {

  val topic: String

  lazy val sns: SnsAsyncClient =
    SnsAsyncClient
      .builder()
      .credentialsProvider(AWSv2.credentials)
      .region(Region.of(conf.Configuration.aws.region))
      .build()

  def sendWithoutSubject(pekkoAsync: PekkoAsync)(message: String)(implicit executionContext: ExecutionContext): Unit = {
    val request = PublishRequest
      .builder()
      .topicArn(topic)
      .message(message)
      .build()

    publishTopic(pekkoAsync)(request)
  }

  private def publishTopic(
      pekkoAsync: PekkoAsync,
  )(request: PublishRequest)(implicit executionContext: ExecutionContext): Unit = {
    pekkoAsync.after1s {
      log.info(s"Issuing SNS notification: ${request.subject()}:${request.message()}")

      sns
        .publish(request)
        .asScala
        .onComplete {
          case Success(_) =>
            log.info(s"Successfully published SNS notification: ${request.subject()}:${request.message()}")
          case Failure(error) =>
            log.error(s"Failed to publish SNS notification: ${request.subject}:${request.message}", error)
        }
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
