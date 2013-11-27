package controllers

import play.api.mvc.{Action, Controller}
import conf.HealthcheckPage

object ArticleHealthcheckController extends Controller {

  def healthcheck() = Action(if (HealthcheckPage.isOk) Ok("OK") else ServiceUnavailable("Service Unavailable"))

}
