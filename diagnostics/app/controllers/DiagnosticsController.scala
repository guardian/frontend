package controllers

import common._
import play.api.mvc.{ Content => _, _ }
import model.diagnostics.javascript.JavaScript
import model.diagnostics.abtests.AbTests
import model.diagnostics.analytics.Analytics
import model.diagnostics.ads.Ads

object DiagnosticsController extends Controller with Logging {

  def js = Action { implicit request =>
    JavaScript.report(request)
    OnePix()
  }

  def ab = Action { implicit request =>
    AbTests.report(request.queryString)
    OnePix()
  }

  def ads = Action { implicit request =>
    Ads.report(request)
    OnePix()
  }

  def analytics(prefix: String) = Action {
    Analytics.report(prefix)
    OnePix()
  }

}
