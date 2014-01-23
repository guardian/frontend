package controllers

import common._
import play.api.mvc.{ Content => _, _ }
import model.diagnostics.javascript.JavaScript
import model.diagnostics.alpha.Alpha
import model.diagnostics.abtests.AbTests
import model.diagnostics.analytics.Analytics

object DiagnosticsController extends Controller with Logging {

  def js = Action { implicit request =>
    JavaScript.report(request)
    OnePix()
  } 
  
  def px = Action { implicit request =>
    Alpha.report(request.queryString)
    OnePix()
  }

  def ab = Action { implicit request =>
    AbTests.report(request.queryString)
    OnePix()
  }

  def analytics(prefix: String) = Action {
    Analytics.report(prefix)
    OnePix()
  }

}
