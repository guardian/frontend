package controllers.admin

import play.api.mvc.Controller
import common.{ExecutionContexts, Logging}
import controllers.AuthLogging
import model.NoCache
import scala.concurrent.Future
import play.api.libs.ws.WS
import play.api.Play.current

object AnalyticsController extends Controller with Logging with AuthLogging with ExecutionContexts {
  def abtests() = AuthActions.AuthActionTest.async { request =>
    Future(NoCache(Ok(views.html.abtests("PROD"))))
  }

  def renderQuality() = AuthActions.AuthActionTest.async { request =>
    WS.url("https://s3-eu-west-1.amazonaws.com/omniture-dashboard/index.html").get() map { response =>
      NoCache(Ok(views.html.quality("PROD", response.body)))
    }
  }
}
