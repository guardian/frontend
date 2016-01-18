package controllers

import play.api.mvc._

object NewsAlertController extends Controller {
  def alerts() = Action {
    Ok("No alert yet")
  }

}
