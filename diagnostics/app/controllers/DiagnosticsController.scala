package controllers

import common._
import conf._
import play.api.mvc.{ Content => _, _ }
import play.api.libs.iteratee.Enumerator
import play.api.Play.current
import play.api.libs.concurrent.Execution.Implicits._
import model.diagnostics.javascript._
import model.diagnostics.viewability._
import model.diagnostics.alpha._
import model.NoCache

object DiagnosticsController extends Controller with Logging {
 
  import org.apache.commons.codec.binary.Base64
  
  lazy val gif = {
    val data = "R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs="
    Base64.decodeBase64(data.getBytes("utf-8")).toArray
  }

  def js = Action { implicit request =>
    JavaScript.report(request.queryString, request.headers.get("user-agent").getOrElse("UNKNOWN USER AGENT"))
    NoCache(Ok(gif).as("image/gif"))
  } 
  
  def px = Action { implicit request =>
    Alpha.report(request.queryString)
    NoCache(Ok(gif).as("image/gif"))
  } 
  
  def ads(top: Option[Int], bottom: Option[Int], inline: Option[Int], mpu: Option[Int], first: Option[Int], layout: Option[String], variant: Option[String], id: Option[String]) = Action { implicit request =>
    Viewability.report(top, bottom, inline, mpu, first, layout, variant, id)
    NoCache(Ok(gif).as("image/gif"))
  } 

}
