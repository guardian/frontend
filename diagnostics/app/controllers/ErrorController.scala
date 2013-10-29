package controllers

import common._
import conf._
import play.api.mvc.{ Content => _, _ }
import play.api.libs.iteratee.Enumerator
import play.api.Play.current
import play.api.libs.concurrent.Execution.Implicits._
import model.diagnostics._ 

object ErrorController extends Controller with Logging {

  def report = Action.async { implicit request =>
    AirBrake.lg.map {
      response => Ok("hello") // TODO: send back a gif?
    }
  } 

}
