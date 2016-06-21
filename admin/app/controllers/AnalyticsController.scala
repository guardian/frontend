package controllers.admin

import play.api.mvc.Controller
import common.{ExecutionContexts, Logging}
import controllers.AuthLogging
import model.NoCache
import scala.concurrent.Future
import play.api.libs.ws.WS
import play.api.Play.current
import model.quality.QualityData

class AnalyticsController extends Controller with Logging with AuthLogging with ExecutionContexts {
  def abtests() = AuthActions.AuthActionTest.async { implicit request =>
    Future(NoCache(Ok(views.html.abtests("PROD"))))
  }

  def renderQuality() = AuthActions.AuthActionTest.async { implicit request =>
      val charts = List("browsersTop25", "operatingSystemsTop25")
      val response = charts.map { chartName =>
        (chartName -> QualityData.getReport(chartName).getOrElse(""))
      }.toMap

      Future(NoCache(Ok(views.html.quality("PROD", response))))

  }

}
