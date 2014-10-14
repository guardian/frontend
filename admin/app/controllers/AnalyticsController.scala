package controllers.admin

import play.api.mvc.Controller
import common.{ExecutionContexts, Logging}
import controllers.AuthLogging
import model.NoCache

object AnalyticsController extends Controller with Logging with AuthLogging with ExecutionContexts {
  def abtests() = AuthActions.AuthActionTest.async { request =>
    for {
      abCharts <- model.abtests.AbTests.getAbCharts()
    } yield NoCache(Ok(views.html.abtests("PROD", abCharts.filter(_.hasData))))
  }
}
