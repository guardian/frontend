package frontpress

import java.nio.ByteBuffer

import com.amazonaws.handlers.AsyncHandler
import com.amazonaws.regions.{Region, Regions}
import com.amazonaws.services.kinesis.AmazonKinesisAsyncClient
import com.amazonaws.services.kinesis.model.{PutRecordRequest, PutRecordResult}
import com.gu.facia.api.ApiError
import conf.Configuration
import play.api.Logger
import play.api.libs.json.Json


object StatusNotificationMessage {
  implicit val jsonFormat = Json.format[StatusNotificationMessage]
}
case class StatusNotificationMessage(
  status: String,
  front: String,
  isLive: Boolean
)

object StatusNotification {
  lazy val partitionKey: String = "facia-tool-updates"

  object KinesisLoggingAsyncHandler extends AsyncHandler[PutRecordRequest, PutRecordResult] {
    def onError(exception: Exception) {
      Logger.error(s"Kinesis PutRecord request error: ${exception.getMessage}}")}
    def onSuccess(request: PutRecordRequest, result: PutRecordResult) {
      Logger.info(s"Kinesis status notification sent to stream:${request.getStreamName}")}
  }

  lazy val client: AmazonKinesisAsyncClient = {
    val c = new AmazonKinesisAsyncClient(Configuration.aws.mandatoryCredentials)
    c.setRegion(Region.getRegion(Regions.fromName(Configuration.aws.region)))
    c
  }


  def notifyFailedJob(front: String, isLive: Boolean, reason: ApiError) = {
    putMessage(StatusNotificationMessage(
      status = s"Error: ${reason.cause} ${reason.message}",
      front = front,
      isLive = isLive
    ))}

  def notifyCompleteJob(front: String, isLive: Boolean) = {
    putMessage(StatusNotificationMessage(
      status = "ok",
      front = front,
      isLive = isLive
    ))}

  def putMessage(message: StatusNotificationMessage): Unit = {
    Configuration.faciatool.frontPressStatusNotificationStream match {
      case Some(streamName) =>
        client.putRecordAsync(
          new PutRecordRequest()
            .withStreamName(streamName)
            .withPartitionKey(partitionKey)
            .withData(ByteBuffer.wrap(Json.toJson(message).toString.getBytes)),
          KinesisLoggingAsyncHandler)
      case None => Logger.info("Kinesis status notification not configured.")
    }
  }
}
