package controllers

import common._
import conf._
import play.api.mvc.{ Content => _, _ }
import play.api.libs.iteratee.Enumerator
import play.api.Play.current
import play.api.libs.concurrent.Execution.Implicits._
import model.diagnostics._ 

object ErrorController extends Controller with Logging {
 
  private def gif = {
    ("GIF89a^A^@^A^@<80>ÿ^@ÿÿÿ^@^@^@,^@^@^@^@^A^@^A^@^@^B^BD^A^@;").map(_.toByte).toArray
  }

  def px = Action { implicit request =>
    Error.report(request.queryString, request.headers.get("user-agent").getOrElse("UNKNOWN USER AGENT"))
    Ok(gif).as("image/gif")
  } 

}
