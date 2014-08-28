package controllers.admin

import play.api.mvc.Controller
import common.Logging
import controllers.AuthLogging
import model.NoCache

object AnalyticsController extends Controller with Logging with AuthLogging {

  def abtests() = AuthActions.AuthActionTest { request =>
    NoCache(Ok(views.html.abtests("PROD",
      model.abtests.AbTests.getAbCharts().filter(_.hasData)
    )))
  }
}
