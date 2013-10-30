package controllers

import common._
import conf._
import play.api.mvc.{ Content => _, _ }
import play.api.libs.iteratee.Enumerator
import play.api.Play.current
import play.api.libs.concurrent.Execution.Implicits._
import model.diagnostics._ 

object ErrorController extends Controller with Logging {
 
  // this just compiles the application and attached the tailer to the nginx log
  def test = Action { implicit request =>
    Ok("ok")
  } 

  // sends a sample message to Airbrake 
  def report = Action.async { implicit request =>
    AirBrake.send("test", "test message").map {
      response => Ok("hello") 
    }
  } 

}
