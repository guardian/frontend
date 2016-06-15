package conf

import common._
import org.joda.time.DateTime
import play.api.{Application => PlayApp, Mode, Play, GlobalSettings}
import play.api.libs.ws.{WSResponse, WS}
import play.api.mvc._
import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.control.NonFatal

/*
* Healthcheck endpoints are requested periodically
* Results are stored in a cache
* Goal: Requests made to the healthcheck endpoint by the ELBs are not 'inlined'
* */

sealed trait HealthCheckInternalRequestResult
object HealthCheckResultTypes {
  case class Success(statusCode: Int) extends HealthCheckInternalRequestResult
  case class Failure(statusCode: Int, statusText: String) extends HealthCheckInternalRequestResult
  case class Exception(exception: Throwable) extends HealthCheckInternalRequestResult
}

private[conf] case class HealthCheckResult(url: String,
                                           result: HealthCheckInternalRequestResult,
                                           date: DateTime = DateTime.now,
                                           expiration: Duration = (Configuration.healthcheck.updateIntervalInSecs * 2).seconds) {
  private val expirationDate = date.plus(expiration.toMillis)
  private def expired: Boolean = DateTime.now.getMillis > expirationDate.getMillis
  def recentlySucceed: Boolean = result match {
    case r: HealthCheckResultTypes.Success => !expired
    case _ => false
  }
  def formattedResult: String = result match {
    case s: HealthCheckResultTypes.Success => s.statusCode.toString
    case f: HealthCheckResultTypes.Failure => s"${f.statusCode} ${f.statusText}"
    case e: HealthCheckResultTypes.Exception => s"Error: ${e.exception.getLocalizedMessage}"
  }
  def formattedDate: String = if(expired) s"${date} (Expired)" else date.toString
}

private[conf] trait HealthCheckFetcher extends ExecutionContexts with Logging {
  import play.api.Play.current

  protected def fetchResult(baseUrl: String, path: String): Future[HealthCheckResult] = {
    WS.url(s"$baseUrl$path")
      .withHeaders("User-Agent" -> "GU-HealthChecker", "X-Gu-Management-Healthcheck" -> "true")
      .withRequestTimeout(4.seconds.toMillis).get()
      .map {
        response: WSResponse =>
          val result = response.status match {
          case 200 => HealthCheckResultTypes.Success(response.status)
          case _ => HealthCheckResultTypes.Failure(response.status, response.statusText)
        }
          HealthCheckResult(path, result)
      }
      .recover {
        case NonFatal(t) =>
          log.error(s"HealthCheck request to ${path} failed", t)
          HealthCheckResult(path, HealthCheckResultTypes.Exception(t))
      }
  }

  protected def fetchResults(testPort: Int, paths: String*): Future[Seq[HealthCheckResult]] = {
    val defaultPort = 9000
    val port = {
      Play.current.mode match {
        case Mode.Test => testPort
        case _ => defaultPort
      }
    }
    val baseUrl = s"http://localhost:$port"
    Future.sequence(paths.map(fetchResult(baseUrl, _)))
  }

}

private[conf] trait HealthCheckCache extends HealthCheckFetcher {

  protected val cache = AkkaAgent[List[HealthCheckResult]](List[HealthCheckResult]())
  def get() = cache.get()

  def fetchPaths(testPort: Int, paths: String*): Future[List[HealthCheckResult]] = {
    fetchResults(testPort, paths:_*).flatMap(allResults => cache.alter(allResults.toList))
  }

}

sealed trait HealthCheckPolicy
object HealthCheckPolicy {
  case object All extends HealthCheckPolicy
  case object Any extends HealthCheckPolicy
}

trait HealthCheckController extends Controller {
  def healthCheck(): Action[AnyContent]
}

class CachedHealthCheck(policy: HealthCheckPolicy, testPort: Int, paths: String*) extends HealthCheckController with Results with ExecutionContexts with Logging {

  private[conf] val cache: HealthCheckCache = new HealthCheckCache {}

  private def allSuccessful(results: List[HealthCheckResult]): Boolean = {
    results match {
      case Nil => false
      case nonEmpty => nonEmpty.forall(_.recentlySucceed)
    }
  }
  private def anySuccessful(results: List[HealthCheckResult]): Boolean = results.exists(_.recentlySucceed)
  private def successful(results: List[HealthCheckResult]): Boolean = policy match {
    case HealthCheckPolicy.All => allSuccessful(results)
    case HealthCheckPolicy.Any => anySuccessful(results)
  }

  def healthCheck(): Action[AnyContent] = Action.async {
    Future.successful {
      val results = cache.get
      val response = results.map {
        case r: HealthCheckResult => s"GET ${r.url} '${r.formattedResult}' '${r.formattedDate}'"
      }
        .mkString("\n")
      if(successful(results)) Ok(response) else ServiceUnavailable(response)
    }
  }

  def runChecks: Future[Unit] = cache.fetchPaths(testPort, paths:_*).map(_ => Nil)
}

case class AllGoodCachedHealthCheck(testPort: Int, paths: String*)
  extends CachedHealthCheck(HealthCheckPolicy.All, testPort, paths:_*)

case class AnyGoodCachedHealthCheck(testPort: Int, paths: String*)
  extends CachedHealthCheck(HealthCheckPolicy.Any, testPort, paths:_*)

class CachedHealthCheckLifeCycle(
  healthCheckController: CachedHealthCheck,
  jobs: JobScheduler = Jobs,
  akkaAsync: AkkaAsync = AkkaAsync) extends LifecycleComponent {

  private val healthCheckRequestFrequencyInSec = Configuration.healthcheck.updateIntervalInSecs

  override def start() = {
    jobs.deschedule("HealthCheckFetch")
    if (healthCheckRequestFrequencyInSec > 0) {
      jobs.scheduleEveryNSeconds("HealthCheckFetch", healthCheckRequestFrequencyInSec) {
        healthCheckController.runChecks
      }
    }

    akkaAsync.after1s {
      healthCheckController.runChecks
    }
  }
}
