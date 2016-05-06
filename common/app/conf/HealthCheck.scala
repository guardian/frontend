package conf

import common._
import org.joda.time.DateTime
import play.api.{Mode, Play}
import play.api.libs.ws.{WSResponse, WS}
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

sealed trait HealthCheckInternalRequestResult
object HealthCheckResultTypes {
  case class Success(statusCode: Int) extends HealthCheckInternalRequestResult
  case class Failure(statusCode: Int, statusText: String) extends HealthCheckInternalRequestResult
  case class Exception(exception: Throwable) extends HealthCheckInternalRequestResult
}

private[conf] case class HealthCheckResult(url: String,
                                           result: HealthCheckInternalRequestResult,
                                           date: DateTime = DateTime.now,
                                           expiration: Duration = 10.seconds) {
  private val expirationDate = date.plus(expiration.toMillis)
  private def expired: Boolean = DateTime.now.getMillis > expirationDate.getMillis
  def recentlySucceed: Boolean = result match {
    case r: HealthCheckResultTypes.Success => true
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

  protected def fetchResult(baseUrl: String, port: Int, path: String): Future[HealthCheckResult] = {
    WS.url(s"$baseUrl$path")
      .withHeaders("User-Agent" -> "GU-HealthChecker", "X-Gu-Management-Healthcheck" -> "true")
      .withRequestTimeout(10000).get()
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
    val port = {
      Play.current.mode match {
        case Mode.Test => testPort
        case _ => 9000
      }
    }
    val baseUrl = s"http://localhost:$port"
    Future.sequence(paths.map(fetchResult(baseUrl, port, _)))
  }

}

private[conf] trait HealthCheckCache extends HealthCheckFetcher {

  protected val cache = AkkaAgent[Map[String, HealthCheckResult]](Map.empty)
  def get() = cache.get()

  def allSuccessful: Boolean = {
    get().values.toList match {
      case Nil => false
      case nonEmpty => nonEmpty.forall(_.recentlySucceed)
    }
  }
  def anySuccessful: Boolean = get().values.exists(_.recentlySucceed)

  def fetchPaths(testPort: Int, paths: Seq[String]): Future[Unit] = {
    log.info("Fetching HealthChecks...")
    fetchResults(testPort, paths:_*)
      .map { m =>
      m.foreach { case healthCheckResult =>
        cache.alter(_.updated(healthCheckResult.url, healthCheckResult))
      }
    }
  }
}
object HealthCheckCache extends HealthCheckCache

trait CachedHealthCheckController extends Controller with Results with ExecutionContexts with Logging {

  val paths: Seq[String]
  val testPort: Int

  def healthCheck(): Action[AnyContent]
  private[conf] val cache: HealthCheckCache = HealthCheckCache

  def runChecks: Future[Unit] = cache.fetchPaths(testPort, paths)

  private def healthCheckResponse(condition: => Boolean): Action[AnyContent] = Action.async {
    Future.successful {
      val response = cache.get().map {
        case (url, r) => s"GET ${url} '${r.formattedResult}' '${r.formattedDate}'"
      }
        .mkString("\n")
      if(condition) Ok(response) else ServiceUnavailable(response)
    }
  }

  def healthCheckAll(): Action[AnyContent] = healthCheckResponse(cache.allSuccessful)
  def healthCheckAny(): Action[AnyContent] = healthCheckResponse(cache.anySuccessful)
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

