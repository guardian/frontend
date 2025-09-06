package frontpress

import com.gu.facia.api.ApiError
import conf.Configuration
import conf.switches.Switches.FaciaPressStatusNotifications
import play.api.Logger
import play.api.libs.json.{Json, OFormat}
import software.amazon.awssdk.core.SdkBytes
import software.amazon.awssdk.services.kinesis.model.PutRecordRequest
import software.amazon.awssdk.services.kinesis.{KinesisAsyncClient, KinesisAsyncClientBuilder}
import utils.AWSv2

import scala.concurrent.ExecutionContext
import scala.jdk.FutureConverters._
import scala.util.{Failure, Success}

object StatusNotificationMessage {
  implicit val jsonFormat: OFormat[StatusNotificationMessage] = Json.format[StatusNotificationMessage]
}
case class StatusNotificationMessage(
    status: String,
    front: String,
    isLive: Boolean,
    message: Option[String],
)

object StatusNotification {
  lazy val log = Logger(getClass)
  lazy val partitionKey: String = "facia-tool-updates"

  lazy val client: KinesisAsyncClient =
    AWSv2.build[KinesisAsyncClient, KinesisAsyncClientBuilder](KinesisAsyncClient.builder())

  def notifyFailedJob(front: String, isLive: Boolean, reason: ApiError)(implicit ec: ExecutionContext): Unit =
    putMessage(
      StatusNotificationMessage(
        status = "error",
        front = front,
        isLive = isLive,
        message = Some(s"${reason.cause} ${reason.message}"),
      ),
    )

  def notifyCompleteJob(front: String, isLive: Boolean)(implicit ec: ExecutionContext): Unit = putMessage(
    StatusNotificationMessage(
      status = "ok",
      front = front,
      isLive = isLive,
      message = None,
    ),
  )

  def putMessage(message: StatusNotificationMessage)(implicit ec: ExecutionContext): Unit = {
    if (FaciaPressStatusNotifications.isSwitchedOn) {
      Configuration.faciatool.frontPressStatusNotificationStream match {
        case Some(streamName) =>
          client
            .putRecord(
              PutRecordRequest
                .builder()
                .streamName(streamName)
                .partitionKey(partitionKey)
                .data(SdkBytes.fromUtf8String(Json.toJson(message).toString()))
                .build(),
            )
            .asScala
            .onComplete {
              case Success(_) =>
                log.info(s"Kinesis status notification sent to stream:$streamName")
              case Failure(exception) =>
                log.error(s"Kinesis PutRecord request error: ${exception.getMessage}}")
            }
        case None => log.info("Kinesis status notification not configured.")
      }
    }
  }
}
