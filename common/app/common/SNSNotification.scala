package common

import play.api.libs.json.Json

object SNSNotification {
  implicit val jsonFormats = Json.format[SNSNotification]
}

case class SNSNotification(
    MessageId: String,
    TopicArn: String,
    Subject: Option[String],
    Message: String,
    Timestamp: String,
    SignatureVersion: String,
    Signature: String,
    SigningCertURL: String,
    UnsubscribeURL: String,
)
