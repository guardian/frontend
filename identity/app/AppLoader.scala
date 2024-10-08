import org.apache.pekko.actor.{ActorSystem => PekkoActorSystem}
import http.IdentityHttpErrorHandler
import app.{FrontendApplicationLoader, FrontendComponents}
import com.softwaremill.macwire._
import common.CloudWatchMetricsLifecycle
import conf._
import conf.switches.SwitchboardLifecycle
import controllers.{HealthCheck, IdentityControllers}
import dev.DevAssetsController
import model.ApplicationIdentity
import play.api.ApplicationLoader.Context
import http.IdentityFilters
import play.api._
import play.api.http.HttpErrorHandler
import play.api.libs.ws.WSClient
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import play.filters.csrf.CSRFComponents
import router.Routes
import services.newsletters.NewsletterSignupLifecycle

class AppLoader extends FrontendApplicationLoader {
  def buildComponents(context: Context): FrontendComponents =
    new BuiltInComponentsFromContext(context) with AppComponents
}

trait Controllers extends IdentityControllers {
  self: BuiltInComponents with IdentityConfigurationComponents =>
  def wsClient: WSClient
  lazy val healthCheck = wire[HealthCheck]
  lazy val devAssetsController = wire[DevAssetsController]
}

trait AppLifecycleComponents {
  self: FrontendComponents with Controllers =>

  override lazy val lifecycleComponents = List(
    wire[IdentityLifecycle],
    wire[CloudWatchMetricsLifecycle],
    wire[SwitchboardLifecycle],
    wire[NewsletterSignupLifecycle],
  )

  def pekkoActorSystem: PekkoActorSystem
}

trait AppComponents
    extends FrontendComponents
    with Controllers
    with AppLifecycleComponents
    with IdentityConfigurationComponents
    with CSRFComponents {

  lazy val router: Router = wire[Routes]

  lazy val appIdentity = ApplicationIdentity("identity")
  override lazy val httpFilters: Seq[EssentialFilter] = wire[IdentityFilters].filters
  override lazy val httpErrorHandler: HttpErrorHandler = wire[IdentityHttpErrorHandler]
}
