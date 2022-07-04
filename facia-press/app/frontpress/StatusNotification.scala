package frontpress

import java.nio.ByteBuffer

import com.amazonaws.handlers.AsyncHandler
import com.amazonaws.services.kinesis.{AmazonKinesisAsync, AmazonKinesisAsyncClient}
import com.amazonaws.services.kinesis.model.{PutRecordRequest, PutRecordResult}
import com.gu.facia.api.ApiError
import conf.Configuration
import conf.switches.Switches.FaciaPressStatusNotifications
import play.api.Logger
import play.api.libs.json.Json

object StatusNotificationMessage {
  implicit val jsonFormat = Json.format[StatusNotificationMessage]
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

  object KinesisLoggingAsyncHandler extends AsyncHandler[PutRecordRequest, PutRecordResult] {
    def onError(exception: Exception): Unit = {
      log.error(s"Kinesis PutRecord request error: ${exception.getMessage}}")
    }
    def onSuccess(request: PutRecordRequest, result: PutRecordResult): Unit = {
      log.info(s"Kinesis status notification sent to stream:${request.getStreamName}")
    }
  }

  lazy val client: AmazonKinesisAsync = {
    AmazonKinesisAsyncClient
      .asyncBuilder()
      .withCredentials(Configuration.aws.mandatoryCredentials)
      .withRegion(conf.Configuration.aws.region)
      .build()
  }

  def notifyFailedJob(front: String, isLive: Boolean, reason: ApiError): Unit = {
    putMessage(
      StatusNotificationMessage(
        status = "error",
        front = front,
        isLive = isLive,
        message = Some(s"${reason.cause} ${reason.message}"),
      ),
    )
  }

  def notifyCompleteJob(front: String, isLive: Boolean): Unit = {
    putMessage(
      StatusNotificationMessage(
        status = "ok",
        front = front,
        isLive = isLive,
        message = None,
      ),
    )
  }

  def putMessage(message: StatusNotificationMessage): Unit = {
    if (FaciaPressStatusNotifications.isSwitchedOn) {
      Configuration.faciatool.frontPressStatusNotificationStream match {
        case Some(streamName) =>
          client.putRecordAsync(
            new PutRecordRequest()
              .withStreamName(streamName)
              .withPartitionKey(partitionKey)
              .withData(ByteBuffer.wrap(Json.toJson(message).toString.getBytes("UTF-8"))),
            KinesisLoggingAsyncHandler,
          )
        case None => log.info("Kinesis status notification not configured.")
      }
    }
  }
}
