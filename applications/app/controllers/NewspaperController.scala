package controllers

import common.{ExecutionContexts, Logging}
import play.api.mvc.{Action, Controller}

object NewspaperController extends Controller with Logging with ExecutionContexts {

  def index() = Action {
    Ok("blah")

  }
}
