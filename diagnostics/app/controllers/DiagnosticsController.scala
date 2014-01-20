package controllers

import common._
import play.api.mvc.{ Content => _, _ }
import model.diagnostics.javascript.JavaScript
import model.diagnostics.alpha.Alpha
import model.diagnostics.abtests.AbTests

object DiagnosticsController extends Controller with Logging {

  def js = Action { implicit request =>
    JavaScript.report(request.queryString, request.headers.get("user-agent").getOrElse("UNKNOWN USER AGENT"))
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

}
