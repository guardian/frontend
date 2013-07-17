package controllers

import play.api.mvc._

object SigninController extends Controller {

  def renderForm = Action {
    Ok("Sigin")
  }

}