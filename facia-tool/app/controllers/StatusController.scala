package controllers

import play.api.mvc.{Action, Controller}
import common.ExecutionContexts
import scala.concurrent.Future
import play.Play

object StatusController extends Controller with ExecutionContexts {

  def healthStatus = Action { request =>
    Ok("Ok.")
  }
}
