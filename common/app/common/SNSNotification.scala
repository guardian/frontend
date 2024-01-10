package common

import play.api.libs.json.{Json, OFormat}

object SNSNotification {
  implicit val jsonFormats: OFormat[SNSNotification] = Json.format[SNSNotification]
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
