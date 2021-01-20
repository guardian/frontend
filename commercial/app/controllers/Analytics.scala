package commercial.controllers

import commercial.model.data.Firehose
import conf.Configuration.environment.isProd
import conf.switches.Switch
import model.Cached.WithoutRevalidationResult
import model.{CacheTime, Cached, TinyResponse}
import play.api.Logger
import play.api.libs.json.Json
import play.api.libs.json.Json.prettyPrint
import play.api.mvc._

import scala.concurrent.ExecutionContext
import scala.util.control.NonFatal

object Analytics extends Results {

  def storeJsonBody[A](switch: Switch, streamName: => String, log: Logger)(
      analytics: String,
  )(implicit ec: ExecutionContext, request: Request[A]): Result = {
    if (switch.isSwitchedOn) {
      if (isProd) {
        val result = Firehose.stream(streamName)(analytics)
        result.failed foreach {
          case NonFatal(e) => log.error(s"Failed to put '$analytics'", e)
        }
      } else log.info(prettyPrint(Json.parse(analytics)))
      TinyResponse.noContent()
    } else
      Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound))
  }
}
