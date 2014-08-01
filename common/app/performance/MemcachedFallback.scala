package performance

import common.{Logging, ExecutionContexts}
import implicits.Dates
import shade.memcached.{Configuration => MemcachedConf, Codec, Memcached}
import scala.concurrent.Future
import scala.concurrent.duration.FiniteDuration
import conf.Switches._
import conf.Configuration
import play.api.Play
import Play.current
import scala.util.Try
import common.FaciaPressMetrics.MemcachedFallbackMetric

object MemcachedFallback extends ExecutionContexts with Dates with Logging {
  private def connectToMemcached(host: String) = {
    val tryConnect = Try {
      Memcached(MemcachedConf(host), actorSystem.scheduler, memcachedExecutionContext)
    }

    tryConnect.failed foreach { error =>
      log.logger.error(s"Error trying to connect to Memcached on $host", error)
    }

    tryConnect
  }

  private lazy val maybeMemcached = for {
    host <- Configuration.memcached.host
    memcached <- connectToMemcached(host).toOption
  } yield memcached

  private def memcached = maybeMemcached.filter(_ => MemcachedFallbackSwitch.isSwitchedOn && !Play.isTest)

  /** If the Future successfully completes, stores its value in Memcached for the cache duration. If the Future fails,
    * attempts to fallback to the value cached in Memcached.
    */
  def withMemcachedFallBack[A: Codec](
    key: String,
    cacheTime: FiniteDuration
  )(f: Future[A]): Future[A] = {
    f onSuccess {
      case a => memcached foreach { m => try { m.set(key, a, cacheTime) } catch { case e: Exception => log.warn(e.toString)} }
    }
    
    f recoverWith {
      case error: Throwable =>
        (memcached map { _.get[A](key) map {
            case None => throw error
            case Some(a) =>
              MemcachedFallbackMetric.increment()
              log.logger.warn(s"Used Memcached value for $key to recover from Content API error", error)
              a
        }
      }).getOrElse(throw error)
    }
  }
}