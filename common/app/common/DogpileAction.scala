package common

import play.api.mvc._
import scala.concurrent.Future
import java.util.concurrent.TimeUnit
import com.google.common.cache.CacheBuilder
import PerformanceMetrics._
import conf.Switches
import Switches.DogpileSwitch

object DogpileAction extends ExecutionContexts {

  private val dogpile = CacheBuilder.newBuilder()
    .concurrencyLevel(4)
    .maximumSize(500)
    .expireAfterWrite(2, TimeUnit.SECONDS)
    .build[String, Future[SimpleResult]]()

  def apply(block: Request[AnyContent] => Future[SimpleResult]): Action[AnyContent] = Action.async{ request =>

    if (DogpileSwitch.isSwitchedOn) {
      val key = defaultKey(request)

      val maybeResult = Option(dogpile.getIfPresent(key))

      maybeResult.foreach(r => dogPileHitMetric.increment())

      maybeResult.getOrElse{
        val result = block(request)
        dogpile.put(key, result)
        result.onComplete{ case _ => dogpile.invalidate(key) }
        dogPileMissMetric.increment()
        result
      }
    } else {
      block(request)
    }
  }

  private def defaultKey(request: Request[AnyContent]): String = {
    val headers = request.headers.toSimpleMap

    // this is set upstream, and is used in case of e.g. AB tests
    val upstreamCacheKey = headers.getOrElse("X-Gu-Cache-Key", "")

    val edition = Edition(request).id

    //The complete request URI, containing both path and query string.
    val uri = request.uri

    s"$uri $edition $upstreamCacheKey"
  }
}