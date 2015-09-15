package conf

import common._
import conf.switches.Switches
import model.Cors
import play.api.{Application, GlobalSettings}
import play.api.mvc.{Result, RequestHeader, Results}

import scala.concurrent.Future

trait CorsErrorHandler extends GlobalSettings with Results with common.ExecutionContexts {

  private val varyFields = List("Origin", "Accept")
  private val defaultVaryFields = varyFields.mkString(",")

  override def onError(request: RequestHeader, ex: Throwable) = {
    // Overriding onError in Dev can hide helpful Exception messages.
    if (play.Play.isDev) {
      super.onError(request, ex)
    } else {
      val headers = request.headers
      val vary = headers.get("Vary").fold(defaultVaryFields)(v => (v :: varyFields).mkString(","))

      Future.successful {
        Cors(InternalServerError.withHeaders("Vary" -> vary))(request)
      }
    }
  }

  override def onHandlerNotFound(request : RequestHeader) : Future[Result] = {
    super.onHandlerNotFound(request).map { Cors(_)(request) };
  }
  override def onBadRequest(request : RequestHeader, error : String) : Future[Result] = {
    super.onBadRequest(request, error).map { Cors(_)(request) };
  }
}

trait SwitchboardLifecycle extends GlobalSettings with ExecutionContexts with Logging {

  override def onStart(app: Application) {
    super.onStart(app)
    Jobs.deschedule("SwitchBoardRefreshJob")
    //run every minute, 47 seconds after the minute
    Jobs.schedule("SwitchBoardRefreshJob", "47 * * * * ?") {
      refresh()
    }

    AkkaAsync {
      refresh()
    }
  }

  override def onStop(app: Application) {
    Jobs.deschedule("SwitchBoardRefreshJob")
    super.onStop(app)
  }

  def refresh() {
    log.info("Refreshing switches")
    services.S3.get(Configuration.switches.key) map { response =>

      val nextState = Properties(response)

      for (switch <- Switches.all) {
        nextState.get(switch.name) foreach {
          case "on" => switch.switchOn()
          case "off" => switch.switchOff()
          case other => log.warn(s"Badly configured switch ${switch.name} -> $other")
        }
      }
    }
  }
}
