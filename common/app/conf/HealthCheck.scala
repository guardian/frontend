package conf

import app.LifecycleComponent
import common._
import org.joda.time.DateTime
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.mvc._
import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration._
import scala.util.control.NonFatal

/*
 * Healthcheck endpoints are requested periodically (or only once if it is set to never expires)
 * Results are stored in a cache
 * Goal: Requests made to the healthcheck endpoint by the ELBs are not 'inlined'
 * */

sealed trait SingleHealthCheck {
  def path: String
  def expires: Option[Duration]
}
/*
 * NeverExpiresSingleHealthCheck should be used when the tested path depends on an upstream service like CAPI, DAPI, etc...
 * The goal is to verify that the frontend app is correctly setup and is able to serve at least once a response that depends on an upstream service
 * while limiting the effect of an unresponsive upstream service upon the health of frontend apps
 */
case class NeverExpiresSingleHealthCheck(override val path: String, override val expires: Option[Duration] = None)
    extends SingleHealthCheck
/*
 * ExpiringSingleHealthCheck should be used when the tested path DOES NOT depends on an upstream service like CAPI, DAPI, etc...
 * The goal of this type of healthcheck is to verify that the instance and the app are running.
 */
case class ExpiringSingleHealthCheck(
    override val path: String,
    override val expires: Option[Duration] = Some((Configuration.healthcheck.updateIntervalInSecs * 2).seconds),
) extends SingleHealthCheck

sealed trait HealthCheckInternalRequestResult
object HealthCheckResultTypes {
  case class Success(statusCode: Int) extends HealthCheckInternalRequestResult
  case class Failure(statusCode: Int, statusText: String) extends HealthCheckInternalRequestResult
  case class Exception(exception: Throwable) extends HealthCheckInternalRequestResult
}

private[conf] case class HealthCheckResult(
    url: String,
    result: HealthCheckInternalRequestResult,
    date: DateTime,
    expiration: Option[Duration],
) {
  private val expirationDate: Option[DateTime] = expiration.map { e => date.plus(e.toMillis) }
  private def expired: Boolean = expirationDate.fold(false)(DateTime.now.getMillis > _.getMillis)
  def recentlySucceed: Boolean =
    result match {
      case _: HealthCheckResultTypes.Success => !expired
      case _                                 => false
    }
  def formattedResult: String =
    result match {
      case s: HealthCheckResultTypes.Success   => s.statusCode.toString
      case f: HealthCheckResultTypes.Failure   => s"${f.statusCode} ${f.statusText}"
      case e: HealthCheckResultTypes.Exception => s"Error: ${e.exception.getLocalizedMessage}"
    }
  def formattedDate: String =
    expiration
      .map(_ => if (expired) s"$date (Expired)" else date.toString)
      .getOrElse("Never expires")
}

private[conf] trait HealthCheckFetcher extends GuLogging {

  val wsClient: WSClient

  private[conf] def fetchResult(baseUrl: String, healthCheck: SingleHealthCheck)(implicit
      executionContext: ExecutionContext,
  ): Future[HealthCheckResult] = {

    wsClient
      .url(s"$baseUrl${healthCheck.path}")
      .withHttpHeaders("User-Agent" -> "GU-HealthChecker", "X-Gu-Management-Healthcheck" -> "true")
      .withRequestTimeout(4.seconds)
      .get()
      .map { response: WSResponse =>
        val result = response.status match {
          case 200 => HealthCheckResultTypes.Success(response.status)
          case _   => HealthCheckResultTypes.Failure(response.status, response.statusText)
        }
        HealthCheckResult(healthCheck.path, result, DateTime.now, healthCheck.expires)
      }
      .recover {
        case NonFatal(t) =>
          log.error(s"HealthCheck request to ${healthCheck.path} failed", t)
          HealthCheckResult(healthCheck.path, HealthCheckResultTypes.Exception(t), DateTime.now, healthCheck.expires)
      }

  }

  protected def fetchResults(
      port: Int,
      preconditionMaybe: Option[HealthCheckPrecondition],
      healthChecks: SingleHealthCheck*,
  )(implicit executionContext: ExecutionContext): Future[Seq[HealthCheckResult]] = {

    val precondition =
      preconditionMaybe.getOrElse(
        HealthCheckPrecondition(() => true, "Precondition is always true"),
      ) //No precondition is equivalent to a precondition that's always true

    val baseUrl = s"http://localhost:$port"

    Future.sequence(
      healthChecks.map { healthCheck =>
        if (precondition.isFulfilled) {
          fetchResult(baseUrl, healthCheck)
        } else {
          val preconditionFailedResult =
            HealthCheckResultTypes.Exception(new RuntimeException(precondition.errorMessage))
          Future.successful(
            HealthCheckResult(healthCheck.path, preconditionFailedResult, DateTime.now, healthCheck.expires),
          )
        }
      },
    )
  }

}

private[conf] class HealthCheckCache(preconditionMaybe: Option[HealthCheckPrecondition])(val wsClient: WSClient)(
    implicit executionContext: ExecutionContext,
) extends HealthCheckFetcher {

  protected val cache: Box[List[HealthCheckResult]] = Box[List[HealthCheckResult]](List[HealthCheckResult]())
  def get(): List[HealthCheckResult] = cache.get()

  def refresh(port: Int, healthChecks: SingleHealthCheck*): Future[List[HealthCheckResult]] = {
    val alreadyFetched = noRefreshNeededResults
    val toFetch: Seq[SingleHealthCheck] = healthChecks.filterNot(h => alreadyFetched.map(_.url).contains(h.path))
    fetchResults(port, preconditionMaybe, toFetch: _*).flatMap(fetchedResults =>
      cache.alter(fetchedResults.toList ++ alreadyFetched),
    )
  }

  private def noRefreshNeededResults(): List[HealthCheckResult] = {
    // No refresh needed for non-expiring results if they have already been fetched successfully
    cache.get.filter(r => !r.expiration.isDefined && r.result.isInstanceOf[HealthCheckResultTypes.Success])
  }
}

sealed trait HealthCheckPolicy
object HealthCheckPolicy {
  case object All extends HealthCheckPolicy
  case object Any extends HealthCheckPolicy
}

case class HealthCheckPrecondition(test: () => Boolean, errorMessage: String) {
  def isFulfilled: Boolean = test()
}

trait HealthCheckController extends BaseController {
  def healthCheck(): Action[AnyContent]
}

abstract class CachedHealthCheck(policy: HealthCheckPolicy, preconditionMaybe: Option[HealthCheckPrecondition])(
    healthChecks: SingleHealthCheck*,
)(implicit wsClient: WSClient)
    extends HealthCheckController
    with Results
    with ImplicitControllerExecutionContext
    with GuLogging {

  val controllerComponents: ControllerComponents

  private[conf] val port: Int = 9000

  private[conf] val cache: HealthCheckCache = new HealthCheckCache(preconditionMaybe)(wsClient)

  private def successful(results: List[HealthCheckResult]): Boolean =
    policy match {
      case HealthCheckPolicy.All => results.nonEmpty && results.forall(_.recentlySucceed)
      case HealthCheckPolicy.Any => results.exists(_.recentlySucceed)
    }

  def healthCheck(): Action[AnyContent] =
    Action.async {
      Future.successful {
        val results = cache.get
        val response = results
          .map { r: HealthCheckResult => s"GET ${r.url} '${r.formattedResult}' '${r.formattedDate}'" }
          .mkString("\n")

        if (successful(results)) Ok(response) else ServiceUnavailable(response)
      }
    }

  def runChecks(): Future[List[HealthCheckResult]] = cache.refresh(port, healthChecks: _*)
}

abstract case class AllGoodCachedHealthCheck(healthChecks: SingleHealthCheck*)(implicit
    wsClient: WSClient,
    executionContext: ExecutionContext,
) extends CachedHealthCheck(policy = HealthCheckPolicy.All, preconditionMaybe = None)(healthChecks: _*)

abstract case class AnyGoodCachedHealthCheck(healthChecks: SingleHealthCheck*)(implicit
    wsClient: WSClient,
    executionContext: ExecutionContext,
) extends CachedHealthCheck(policy = HealthCheckPolicy.Any, preconditionMaybe = None)(healthChecks: _*)

class CachedHealthCheckLifeCycle(
    healthCheckController: CachedHealthCheck,
    jobs: JobScheduler,
    akkaAsync: AkkaAsync,
)(implicit executionContext: ExecutionContext)
    extends LifecycleComponent {

  private lazy val healthCheckRequestFrequencyInSec = Configuration.healthcheck.updateIntervalInSecs

  override def start(): Unit = {
    jobs.deschedule("HealthCheckFetch")
    if (healthCheckRequestFrequencyInSec > 0) {
      jobs.scheduleEvery("HealthCheckFetch", healthCheckRequestFrequencyInSec.seconds) {
        healthCheckController.runChecks().map(_ => ())
      }
    }

    akkaAsync.after1s {
      healthCheckController.runChecks()
    }
  }
}
