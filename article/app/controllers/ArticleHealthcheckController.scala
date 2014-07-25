package controllers

import play.api.mvc.{Action, Controller}
import conf.{HealthCheck, HealthcheckPage}

object ArticleHealthcheckController extends Controller {

  // in the short term we have 2 healthchecks, either can be ok
  private def isOk = HealthcheckPage.isOk || HealthCheck.isOk

  def healthcheck() = Action(if (isOk) Ok("OK") else ServiceUnavailable("Service Unavailable"))


}
