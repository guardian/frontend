package performance

import play.api.libs.ws.WS.WSRequestHolder
import shade.memcached.{Configuration => MemcachedConf, Memcached}
import conf.Configuration
import common.ExecutionContexts
import org.joda.time.DateTime
import play.api.libs.ws.Response
import scala.concurrent.Future
import scala.concurrent.duration.Duration
import implicits.Dates

sealed trait CacheResponse
case class CacheHit(response: Response) extends CacheResponse
case class CacheStale(response: Response) extends CacheResponse
case class CacheMiss(response: Response) extends CacheResponse

case class StaleWrapper(insertedAt: DateTime, response: Response)

object MemcachedWS extends ExecutionContexts with Dates {
  lazy val host = Configuration.memcached.host.head
  lazy val memcached = Memcached(MemcachedConf(host), actorSystem.scheduler, memcachedExecutionContext)

  case class MemcachedWSRequest(
      request: WSRequestHolder,
      key: String,
      staleAfter: Duration,
      doNotServeAfter: Duration
  ) {
    private def triggerRequest() = {
      val responseFuture = request.get()

      responseFuture onSuccess {
        case response if response.status >= 200 && response.status < 300 =>
          memcached.set(key, response, doNotServeAfter)
      }

      responseFuture
    }

    def get() = {
      memcached.get[StaleWrapper](key) flatMap {
        case Some(StaleWrapper(insertedAt, response)) if insertedAt.plus(staleAfter.toJoda).isBefore(DateTime.now()) =>
          triggerRequest()
          Future.successful(CacheStale(response))

        case Some(StaleWrapper(_, response)) =>
          Future.successful(CacheHit(response))

        case None => triggerRequest().map(CacheMiss.apply)
      }
    }
  }

  implicit class RichWSRequest(request: WSRequestHolder) {
    def withMemcachingOnKey(
      key: String,
      staleAfter: Duration,
      doNotServeAfter: Duration
    ) = MemcachedWSRequest(request, key, staleAfter, doNotServeAfter)
  }
}
