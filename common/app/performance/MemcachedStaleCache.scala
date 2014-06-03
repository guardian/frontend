package performance

import org.joda.time.DateTime
import common.{SimpleCountMetric, ExecutionContexts}
import implicits.Dates
import shade.memcached.{Configuration => MemcachedConf, Memcached}
import conf.Configuration
import scala.concurrent.Future
import scala.concurrent.duration.FiniteDuration
import shade.memcached.MemcachedCodecs._

sealed trait CacheResponse[A] {
  val get: A
}

case class CacheHit[A](get: A) extends CacheResponse[A]
case class CacheStale[A](get: A) extends CacheResponse[A]
case class CacheMiss[A](get: A) extends CacheResponse[A]

case class StaleWrapper[A](insertedAt: DateTime, response: A)

case class CacheMetrics(
  misses: SimpleCountMetric,
  hits: SimpleCountMetric,
  stales: SimpleCountMetric
)

object MemcachedStaleCache extends ExecutionContexts with Dates {
  lazy val host = Configuration.memcached.host.head
  lazy val memcached = Memcached(MemcachedConf(host), actorSystem.scheduler, memcachedExecutionContext)

  def cache[A](
      key: String,
      staleAfter: FiniteDuration,
      invalidAfter: FiniteDuration
  )(f: => Future[A]): Future[CacheResponse[A]] = {
    require(invalidAfter gt staleAfter, s"Stale after duration ($staleAfter) must be less than or equal to invalid " +
      s"after duration ($invalidAfter)")

    implicit val staleWrapperCodec = AnyRefBinaryCodec[StaleWrapper[A]]

    def triggerRequest(): Future[A] = {
      val futureA = f

      futureA onSuccess {
        case a => memcached.set(key, StaleWrapper(DateTime.now, a), invalidAfter)
      }

      futureA
    }

    memcached.get[StaleWrapper[A]](key) flatMap {
      case Some(StaleWrapper(insertedAt, response)) if insertedAt.plus(staleAfter.toJoda).isBefore(DateTime.now()) =>
        triggerRequest()
        Future.successful(CacheStale(response))

      case Some(StaleWrapper(_, response)) =>
        Future.successful(CacheHit(response))

      case None =>
        triggerRequest().map(CacheMiss.apply)
    }
  }

  def cacheWithMetrics[A](
    key: String,
    staleAfter: FiniteDuration,
    invalidAfter: FiniteDuration,
    metrics: CacheMetrics
  )(f: => Future[A]) = {
    val response = cache(key, staleAfter, invalidAfter)(f)

    response onSuccess {
      case CacheHit(_) => metrics.hits.increment()
      case CacheMiss(_) => metrics.misses.increment()
      case CacheStale(_) => metrics.stales.increment()
    }

    response.map(_.get)
  }
}
