package performance

import org.joda.time.DateTime
import common.ExecutionContexts
import implicits.Dates
import shade.memcached.{Configuration => MemcachedConf, Codec, Memcached}
import conf.Configuration
import scala.concurrent.Future
import scala.concurrent.duration.Duration

sealed trait CacheResponse[A] {
  val a: A
}

case class CacheHit[A](a: A) extends CacheResponse[A]
case class CacheStale[A](a: A) extends CacheResponse[A]
case class CacheMiss[A](a: A) extends CacheResponse[A]

case class StaleWrapper[A](insertedAt: DateTime, response: A)

object MemcachedStaleCache extends ExecutionContexts with Dates {
  lazy val host = Configuration.memcached.host.head
  lazy val memcached = Memcached(MemcachedConf(host), actorSystem.scheduler, memcachedExecutionContext)

  def cache[A: Codec](
      key: String,
      staleAfter: Duration,
      invalidAfter: Duration
  )(f: => Future[A]): Future[CacheResponse[A]] = {
    def triggerRequest(): Future[A] = {
      val futureA = f

      futureA onSuccess {
        case a => memcached.set(key, a, invalidAfter)
      }

      futureA
    }

    memcached.get[StaleWrapper[A]](key) flatMap {
      case Some(StaleWrapper(insertedAt, response)) if insertedAt.plus(staleAfter.toJoda).isBefore(DateTime.now()) =>
        triggerRequest()
        Future.successful(CacheStale(response))

      case Some(StaleWrapper(_, response)) =>
        Future.successful(CacheHit(response))

      case None => triggerRequest().map(CacheMiss.apply)
    }
  }
}
