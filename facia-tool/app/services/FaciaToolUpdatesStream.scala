package services

import java.nio.ByteBuffer

import com.amazonaws.regions.{Region, Regions}
import frontsapi.model.StreamUpdate
import play.api.libs.json._

import scala.collection.JavaConversions._
import com.amazonaws.handlers.AsyncHandler
import com.amazonaws.services.kinesis.AmazonKinesisAsyncClient
import com.amazonaws.services.kinesis.model.{PutRecordResult, PutRecordRequest}
import common.Logging
import conf.Configuration

object FaciaToolUpdatesStream extends Logging {
  val partitionKey: String = "facia-tool-updates"

  object KinesisLoggingAsyncHandler extends AsyncHandler[PutRecordRequest, PutRecordResult] with Logging {
    def onError(exception: Exception) {
      log.error(s"Kinesis PutRecord request error: ${exception.getMessage}}")
    }
    def onSuccess(request: PutRecordRequest, result: PutRecordResult) {
      log.info(s"Put diff to stream:${request.getStreamName} Seq:${result.getSequenceNumber}")
    }
  }

  val client: AmazonKinesisAsyncClient = {
    val c = new AmazonKinesisAsyncClient(Configuration.aws.mandatoryCredentials)
    c.setRegion(Region.getRegion(Regions.EU_WEST_1))
    c
  }

  def putStreamUpdate(streamUpdate: StreamUpdate): Unit =
    Json.toJson(streamUpdate.update).transform[JsObject](Reads.JsObjectReads) match {
      case JsSuccess(jsonObject, _)  => putString(Json.stringify(jsonObject + ("email", JsString(streamUpdate.email))))
      case JsError(errors)           => log.warn(s"Error converting StreamUpdate: $errors")}

  private def putString(s: String): Unit =
    Configuration.faciatool.faciaToolUpdatesStream.map { streamName =>
      client.putRecordAsync(
        new PutRecordRequest()
          .withData(ByteBuffer.wrap(s.getBytes))
          .withStreamName(streamName)
          .withPartitionKey(partitionKey),
        KinesisLoggingAsyncHandler
      )
    }.getOrElse(log.warn("Cannot put to facia-tool-stream: faciatool.updates.stream is not set"))
}
