package conf

import app.LifecycleComponent
import common._
import org.joda.time.DateTime
import play.api.{Mode, Play}
import play.api.libs.ws.{WS, WSClient, WSResponse}
import play.api.mvc._

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.control.NonFatal

/*
* Healthcheck endpoints are requested periodically (or only once if it is set to never expires)
* Results are stored in a cache
* Goal: Requests made to the healthcheck endpoint by the ELBs are not 'inlined'
* */

sealed trait SingleHealthCheck {
  def path: String
  def expires: HealthCheckExpiration
}
/*
 * NeverExpiresSingleHealthCheck should be used when the tested path depends on an upstream service like CAPI, DAPI, etc...
 * The goal is to verify that the frontend app is correctly setup and is able to serve at least once a response that depends on an upstream service
 * while limiting the effect of an unresponsive upstream service upon the health of frontend apps
 */
case class NeverExpiresSingleHealthCheck(override val path: String,
                                         override val expires: HealthCheckExpiration = HealthCheckExpires.Never) extends SingleHealthCheck
/*
 * ExpiringSingleHealthCheck should be used when the tested path DOES NOT depends on an upstream service like CAPI, DAPI, etc...
 * The goal of this type of healthcheck is to verify that the instance and the app are running.
 */
case class ExpiringSingleHealthCheck(override val path: String,
                                     override val expires: HealthCheckExpiration = HealthCheckExpires.Duration((Configuration.healthcheck.updateIntervalInSecs * 2).seconds)) extends SingleHealthCheck

sealed trait HealthCheckExpiration
object HealthCheckExpires {
  case class Duration(duration: FiniteDuration) extends HealthCheckExpiration
  case object Never extends HealthCheckExpiration
}

sealed trait HealthCheckInternalRequestResult
object HealthCheckResultTypes {
  case class Success(statusCode: Int) extends HealthCheckInternalRequestResult
  case class Failure(statusCode: Int, statusText: String) extends HealthCheckInternalRequestResult
  case class Exception(exception: Throwable) extends HealthCheckInternalRequestResult
}

private[conf] case class HealthCheckResult(url: String,
                                           result: HealthCheckInternalRequestResult,
                                           date: DateTime,
                                           expiration: HealthCheckExpiration) {
  private val expirationDate: Option[DateTime] = expiration match {
    case HealthCheckExpires.Duration(e) => Some(date.plus(e.toMillis))
    case HealthCheckExpires.Never => None
  }
  private def expired: Boolean = expirationDate.fold(false)(DateTime.now.getMillis > _.getMillis)
  def recentlySucceed: Boolean = result match {
    case r: HealthCheckResultTypes.Success => !expired
    case _ => false
  }
  def formattedResult: String = result match {
    case s: HealthCheckResultTypes.Success => s.statusCode.toString
    case f: HealthCheckResultTypes.Failure => s"${f.statusCode} ${f.statusText}"
    case e: HealthCheckResultTypes.Exception => s"Error: ${e.exception.getLocalizedMessage}"
  }
  def formattedDate: String = expiration match {
    case HealthCheckExpires.Never => "Never expires"
    case _ => if (expired) s"${date} (Expired)" else date.toString
  }
}

private[conf] trait HealthCheckFetcher extends ExecutionContexts with Logging {

  def wsClient: WSClient

  protected def fetchResult(baseUrl: String, healthCheck: SingleHealthCheck): Future[HealthCheckResult] = {
    wsClient.url(s"$baseUrl${healthCheck.path}")
      .withHeaders("User-Agent" -> "GU-HealthChecker", "X-Gu-Management-Healthcheck" -> "true")
      .withRequestTimeout(4.seconds.toMillis).get()
      .map {
        response: WSResponse =>
          val result = response.status match {
          case 200 => HealthCheckResultTypes.Success(response.status)
          case _ => HealthCheckResultTypes.Failure(response.status, response.statusText)
        }
          HealthCheckResult(healthCheck.path, result, DateTime.now, healthCheck.expires)
      }
      .recover {
        case NonFatal(t) =>
          log.error(s"HealthCheck request to ${healthCheck.path} failed", t)
          HealthCheckResult(healthCheck.path, HealthCheckResultTypes.Exception(t), DateTime.now, healthCheck.expires)
      }
  }

  protected def fetchResults(testPort: Int, healthChecks: SingleHealthCheck*): Future[Seq[HealthCheckResult]] = {
    val defaultPort = 9000
    val port = {
      Play.current.mode match {
        case Mode.Test => testPort
        case _ => defaultPort
      }
    }
    val baseUrl = s"http://localhost:$port"
    Future.sequence(healthChecks.map(fetchResult(baseUrl, _)))
  }

}

private[conf] class HealthCheckCache(val wsClient: WSClient) extends HealthCheckFetcher {

  protected val cache = AkkaAgent[List[HealthCheckResult]](List[HealthCheckResult]())
  def get(): List[HealthCheckResult] = cache.get()

  def refresh(testPort: Int, healthChecks: SingleHealthCheck*): Future[List[HealthCheckResult]] = {
    val alreadyFetched = noRefreshNeededResults
    val toFetch: Seq[SingleHealthCheck] = healthChecks.filterNot(h => alreadyFetched.map(_.url).contains(h.path))
    fetchResults(testPort, toFetch:_*).flatMap(fetchedResults => cache.alter(fetchedResults.toList ++ alreadyFetched))
  }

  private def noRefreshNeededResults(): List[HealthCheckResult] = {
    // No refresh needed for non-expiring results if they have already been fetched successfully
    cache.get.filter(r => r.expiration == HealthCheckExpires.Never && r.result.isInstanceOf[HealthCheckResultTypes.Success])
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

class CachedHealthCheck(policy: HealthCheckPolicy, wsClient: WSClient, testPort: Int, healthChecks: SingleHealthCheck*) extends HealthCheckController with Results with ExecutionContexts with Logging {

  private[conf] val cache: HealthCheckCache = new HealthCheckCache(wsClient)

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

  def runChecks: Future[Unit] = cache.refresh(testPort, healthChecks:_*).map(_ => Nil)
}

case class AllGoodCachedHealthCheck(wsClient: WSClient, testPort: Int, healthChecks: SingleHealthCheck*)
  extends CachedHealthCheck(HealthCheckPolicy.All, wsClient, testPort, healthChecks:_*)

case class AnyGoodCachedHealthCheck(wsClient: WSClient, testPort: Int, healthChecks: SingleHealthCheck*)
  extends CachedHealthCheck(HealthCheckPolicy.Any, wsClient, testPort, healthChecks:_*)

class CachedHealthCheckLifeCycle(
  healthCheckController: CachedHealthCheck,
  jobs: JobScheduler,
  akkaAsync: AkkaAsync) extends LifecycleComponent {

  private val healthCheckRequestFrequencyInSec = Configuration.healthcheck.updateIntervalInSecs

  override def start() = {
    jobs.deschedule("HealthCheckFetch")
    if (healthCheckRequestFrequencyInSec > 0) {
      jobs.scheduleEvery("HealthCheckFetch", healthCheckRequestFrequencyInSec.seconds) {
        healthCheckController.runChecks
      }
    }

    akkaAsync.after1s {
      healthCheckController.runChecks
    }
  }
}
