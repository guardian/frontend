package commercial.controllers

import java.nio.ByteBuffer

import awswrappers.kinesisfirehose._
import com.amazonaws.services.kinesisfirehose.model.{PutRecordRequest, Record}
import com.amazonaws.services.kinesisfirehose.{AmazonKinesisFirehoseAsync, AmazonKinesisFirehoseAsyncClientBuilder}
import common.Logging
import conf.Configuration.aws.{mandatoryCredentials, region}
import conf.Configuration.commercial.prebidAnalyticsStream
import conf.Configuration.environment.isProd
import conf.switches.Switches.prebidAnalytics
import model.Cached.WithoutRevalidationResult
import model.{CacheTime, Cached, TinyResponse}
import play.api.libs.json.Json
import play.api.libs.json.Json.prettyPrint
import play.api.mvc._

import scala.concurrent.ExecutionContext
import scala.util.control.NonFatal

class PrebidAnalyticsController(val controllerComponents: ControllerComponents) extends BaseController with Logging {

  private implicit val ec: ExecutionContext = controllerComponents.executionContext

  private val firehose: AmazonKinesisFirehoseAsync = {
    AmazonKinesisFirehoseAsyncClientBuilder
      .standard()
      .withCredentials(mandatoryCredentials)
      .withRegion(region)
      .build()
  }

  private val charset = "UTF-8"

  private def streamAnalytics(analytics: String) = {
    val record  = new Record().withData(ByteBuffer.wrap(s"$analytics\n".getBytes(charset)))
    val request = new PutRecordRequest().withDeliveryStreamName(prebidAnalyticsStream).withRecord(record)
    val result  = firehose.putRecordFuture(request)
    result.failed foreach {
      case NonFatal(e) => log.error(s"Failed to put '$analytics'", e)
    }
  }

  def insert(): Action[String] = Action(parse.text) { implicit request =>
    if (prebidAnalytics.isSwitchedOn) {
      if (isProd) streamAnalytics(request.body)
      else log.info(prettyPrint(Json.parse(request.body)))
      TinyResponse.noContent()
    } else
      Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound))
  }
}
