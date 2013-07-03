package controllers

import play.api.mvc.Controller
import common.Logging
import tools.{ NewPageviewsGraph, PageviewsGraph }


object AnalyticsController extends Controller with Logging with AuthLogging {
  def render() = AuthAction{ request =>
      // thats right, we only do PROD analytics
      Ok(views.html.analytics("PROD", Seq(PageviewsGraph, NewPageviewsGraph)))
  }
}
