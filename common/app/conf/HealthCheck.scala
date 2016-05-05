package conf

import common._
import org.joda.time.DateTime
import play.api.{Mode, Play}
import play.api.libs.ws.WS
import play.api.mvc._
import play.api.{Application => PlayApp, GlobalSettings}
import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.control.NonFatal

/*
* Healthcheck endpoints are requested periodically
* Results are stored in a cache
* Goal: Requests made to the healthcheck endpoint by the ELBs are not 'inlined'
* */

private[conf] case class HealthCheckResult(url: String,
                                           result: Either[Throwable, Int], // Status code if success, throwable otherwise
                                           date: DateTime = DateTime.now,
                                           expiration: Duration = 10.seconds) {
  private val expirationDate = date.plus(expiration.toMillis)
  private def expired = DateTime.now.getMillis > expirationDate.getMillis
  def recentlySucceed = result.fold(_ => false, _ == 200) && !expired
  def formattedResult = result match {
    case Left(t) => s"Error: ${t.getLocalizedMessage}"
    case Right(status) => status
  }
  def formattedDate = if(expired) s"${date} (Expired)" else date
}

private[conf] trait HealthCheckFetcher extends ExecutionContexts with Logging {

  import play.api.Play.current

  def testPort: Int

  lazy val port = {
    Play.current.mode match {
      case Mode.Test => testPort
      case _ => 9000
    }
  }

  lazy val baseUrl = s"http://localhost:$port"

  protected def fetchResult(path: String): Future[HealthCheckResult] = {
    WS.url(s"$baseUrl$path")
      .withHeaders("X-Gu-Management-Healthcheck" -> "true")
      .withRequestTimeout(10000).get()
      .map(result => HealthCheckResult(path, Right(result.status)))
      .recover {
        case NonFatal(t) =>
          log.error(s"HealthCheck request to ${path} failed", t)
          HealthCheckResult(path, Left(t))
      }
  }

  protected def fetchResults(paths: String*): Seq[Future[HealthCheckResult]] = paths.map(fetchResult)

}

private[conf] trait HealthCheckCache extends HealthCheckFetcher {

  protected val cache = AkkaAgent[Map[String, HealthCheckResult]](Map.empty)
  def get() = cache.get()

  def allSuccessful = cache.get().values.toList match {
    case Nil => false
    case nonEmpty => nonEmpty.forall(_.recentlySucceed)
  }
  def anySuccessful = cache.get().values.exists(_.recentlySucceed)

  def fetchPaths(paths: Seq[String]) = {
    log.info("Fetching HealthChecks...")
    val healthCheckResults = fetchResults(paths:_*)

    Future.sequence(healthCheckResults)
      .map { m =>
        m.foreach { case healthCheckResult =>
          cache.alter(_.updated(healthCheckResult.url, healthCheckResult))
        }
      }
  }

}

trait CachedHealthCheckController extends Controller with Results with ExecutionContexts with Logging {

  val paths: Seq[String]
  val port: Int

  def healthCheck(): Action[AnyContent]
  private val cache = new HealthCheckCache {
    override def testPort: Int = port
  }

  def runChecks = cache.fetchPaths(paths)

  private def healthCheckResponse(condition: => Boolean) = Action.async {
    Future.successful {
      val response = cache.get().map {
        case (url, r) => s"GET ${url} '${r.formattedResult}' '${r.formattedDate}'"
      }
        .mkString("\n")
      if(condition) Ok(response) else ServiceUnavailable(response)
    }
  }

  def healthCheckAll() = healthCheckResponse(cache.allSuccessful)
  def healthCheckAny() = healthCheckResponse(cache.anySuccessful)
}

trait CachedHealthCheckLifeCycle extends GlobalSettings {

  private val healthCheckRequestFrequencyInSec = 5

  val healthCheckController: CachedHealthCheckController

  override def onStart(app: PlayApp) = {
    Jobs.deschedule("HealthCheckFetch")
    Jobs.scheduleEveryNSeconds("HealthCheckFetch", healthCheckRequestFrequencyInSec) {
      healthCheckController.runChecks
    }

    AkkaAsync {
      healthCheckController.runChecks
    }
  }
}

