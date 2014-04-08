package services

import common.{AkkaAsync, Logging}
import com.amazonaws.services.sns.AmazonSNSAsyncClient
import com.amazonaws.services.sns.model.PublishRequest
import conf.Configuration

trait Notification extends Logging {

  val topic: String

  def sns = {
    val client = new AmazonSNSAsyncClient(Configuration.aws.credentials)
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

  private def sendAsync(request: PublishRequest) =
    AkkaAsync {
      log.info(s"Issuing SNS notification: ${request.getSubject}:${request.getMessage}")
      sns.publish(request)
    }
}

object Notification extends Notification {
  lazy val topic: String = Configuration.aws.notificationSns

  def onSwitchChanges(requester: String, stage: String, changes: List[String]) {
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
