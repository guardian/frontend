package services

import common.{AkkaAsync, Logging}
import com.amazonaws.services.sns.AmazonSNSAsyncClient
import com.amazonaws.services.sns.model.PublishRequest
import conf.Configuration

object Notification extends Logging {

  lazy val topic = Configuration.aws.sns

  def sns = {
    val client = new AmazonSNSAsyncClient(Configuration.aws.credentials)
    client.setEndpoint("http://sns.%s.amazonaws.com" format Configuration.aws.region)

    client
  }

  def send(subject: String, message: String) {
    val request = new PublishRequest()
      .withTopicArn(topic)
      .withSubject(subject)
      .withMessage(message)

    AkkaAsync {
      log.info("Issuing SNS notification for switch change.")
      sns.publish(request)
    }
  }

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
