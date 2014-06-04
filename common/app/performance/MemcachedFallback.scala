package performance

import common.ExecutionContexts
import implicits.Dates
import shade.memcached.{Configuration => MemcachedConf, Codec, Memcached}
import conf.Configuration
import scala.concurrent.Future
import scala.concurrent.duration.FiniteDuration

object MemcachedFallback extends ExecutionContexts with Dates {
  lazy val host = Configuration.memcached.host.head
  lazy val memcached = Memcached(MemcachedConf(host), actorSystem.scheduler, memcachedExecutionContext)

  /** If the Future successfully completes, stores its value in Memcached for the cache duration. If the Future fails,
    * attempts to fallback to the value cached in Memcached.
    */
  def withMemcachedFallBack[A: Codec](
    key: String,
    cacheTime: FiniteDuration
  )(f: Future[A]): Future[A] = {
    f onSuccess {
      case a => memcached.set(key, a, cacheTime)
    }
    
    f recoverWith {
      case error: Throwable => 
        memcached.get[A](key) map {
          case None => throw error
          case Some(a) => a
        }
    }
  }
}
