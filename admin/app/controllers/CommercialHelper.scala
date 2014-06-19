package controllers.admin

import common.Logging
import controllers.AuthLogging
import dfp._
import model.NoCache
import play.api.libs.json.Json
import play.api.mvc.Controller
import tools.Store

object CommercialHelper extends Controller with Logging with AuthLogging {

  def activeLineItems() = Authenticated { request =>
    NoCache(Ok(views.html.commercialReports.lineitems("PROD")))
  }
}
