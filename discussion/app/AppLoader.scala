import akka.actor.ActorSystem
import dev.DevAssetsController
import http.{CommonFilters, CorsHttpErrorHandler}
import app.{FrontendApplicationLoader, FrontendComponents}
import com.softwaremill.macwire._
import common._
import common.Logback.{LogbackOperationsPool, LogstashLifecycle}
import conf.switches.SwitchboardLifecycle
import conf.CachedHealthCheckLifeCycle
import controllers.{DiscussionControllers, HealthCheck}
import discussion.api.DiscussionApi
import model.ApplicationIdentity
import play.api.ApplicationLoader.Context
import play.api.BuiltInComponentsFromContext
import play.api.http.HttpErrorHandler
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import play.api.libs.ws.WSClient
import router.Routes

class AppLoader extends FrontendApplicationLoader {
  override def buildComponents(context: Context): FrontendComponents =
    new BuiltInComponentsFromContext(context) with AppComponents
}

trait DiscussionServices {
  def wsClient: WSClient

  lazy val discussionApi = wire[DiscussionApi]
}

trait AppComponents extends FrontendComponents with DiscussionControllers with DiscussionServices {

  lazy val healthCheck = wire[HealthCheck]
  lazy val devAssetsController = wire[DevAssetsController]
  lazy val logbackOperationsPool = wire[LogbackOperationsPool]

  override lazy val lifecycleComponents = List(
    wire[LogstashLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[SwitchboardLifecycle],
    wire[CachedHealthCheckLifeCycle],
  )

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("discussion")

  override lazy val httpErrorHandler: HttpErrorHandler = wire[CorsHttpErrorHandler]
  override lazy val httpFilters: Seq[EssentialFilter] = wire[CommonFilters].filters
  def actorSystem: ActorSystem
}
