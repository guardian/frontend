package controllers.admin

import play.api.mvc.Controller
import common.Logging
import controllers.AuthLogging
import tools._
import model.NoCache

object AnalyticsController extends Controller with Logging with AuthLogging {

  // We only do PROD analytics

  def abtests() = Authenticated { request =>
    NoCache(Ok(views.html.abtests("PROD",
      model.abtests.AbTests.getAbCharts().filter(_.hasData)
    )))
  }
}
