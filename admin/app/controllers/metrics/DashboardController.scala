package controllers.admin

import common.Logging
import controllers.AuthLogging
import play.api.mvc.Controller
import tools.{HttpErrors, CloudWatch}
import model.NoCache

object DashboardController extends Controller with Logging with AuthLogging {
  // We only do PROD metrics

  def renderDashboard() = Authenticated { request =>
    NoCache(Ok(views.html.dashboard("PROD", CloudWatch.fullStack, CloudWatch.requestOkFullStack)))
  }

  def renderErrors() = Authenticated { request =>
    NoCache(Ok(views.html.requestCounts("PROD", Seq(HttpErrors.global4XX, HttpErrors.global5XX))))
  }

  def render4XX() = Authenticated { request =>
    NoCache(Ok(views.html.requestCounts("PROD", HttpErrors.notFound)))
  }

  def render5XX() = Authenticated { request =>
    NoCache(Ok(views.html.requestCounts("PROD", HttpErrors.errors)))
  }
}
