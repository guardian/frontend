package services

import com.amazonaws.services.sns.AmazonSNSAsyncClient
import com.amazonaws.services.sns.model.PublishRequest
import common.{ExecutionContexts, AkkaAsync, Logging}
import conf.Configuration
import awswrappers.sns._

import scala.util.{Failure, Success}

trait Notification extends Logging with ExecutionContexts {

  val topic: String

  lazy val sns: Option[AmazonSNSAsyncClient] = Configuration.aws.credentials.map{ credentials =>
    val client = new AmazonSNSAsyncClient(credentials)
    client.setEndpoint(AwsEndpoints.sns)
    client
  }

  def send(subject: String, message: String) {
    val request = new PublishRequest()
      .withTopicArn(topic)
      .withSubject(subject)
      .withMessage(message)

    sendAsync(request)
  }

  def sendWithoutSubject(message: String) {
    val request = new PublishRequest()
      .withTopicArn(topic)
      .withMessage(message)

    sendAsync(request)
  }

  private def sendAsync(request: PublishRequest) = AkkaAsync {
    log.info(s"Issuing SNS notification: ${request.getSubject}:${request.getMessage}")
    sns foreach { client =>
      client.publishFuture(request) onComplete {
        case Success(_) =>
          log.info(s"Successfully published SNS notification: ${request.getSubject}:${request.getMessage}")

        case Failure(error) =>
          log.error(s"Failed to publish SNS notification: ${request.getSubject}:${request.getMessage}", error)
      }
    }
  }
}

object Notification extends Notification {
  lazy val topic: String = Configuration.aws.notificationSns

  def onSwitchChanges(requester: String, stage: String, changes: Seq[String]) {
    val subject = s"${stage.toUpperCase}: Switch changes by ${requester}"
    val message =
      s"""
          |The following updates have been made to the ${stage.toUpperCase} switches by ${requester}.
          |
          |${ changes mkString "\n" }
          |
        """.stripMargin

    send(subject, message)
  }
}

object FrontPressNotification extends Notification {
  lazy val topic: String = Configuration.aws.frontPressSns.getOrElse("")
}

object MissingVideoEncodings extends Notification {
  lazy val topic: String = "arn:aws:sns:eu-west-1:642631414762:frontend-missingVideoEncodingsNotificationTopic"

  def sendMessage(encoding: String, url: String, webTitle: String): Unit = {
    val subject = "Missing video encoding found"
    val message =
        s"""
           |There was a video encoding missing for for page: $webTitle url: $url
           |
           |Its location is supposed to be: $encoding
         """.stripMargin

    super.send(subject, message)
  }

}


