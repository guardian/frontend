package controllers

import play.api.mvc.{Action, Controller}
import conf.HealthcheckPage

object ArticleHealthcheckController extends Controller {

  def healthcheck() = Action(Ok("OK"))

}
