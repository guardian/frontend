package controllers

import common.ExecutionContexts
import play.api.mvc.{Action, Controller}

object TagIndexController extends Controller with ExecutionContexts {

  def subject(a: String) = Action {
    Ok("Yo")
  }
}
