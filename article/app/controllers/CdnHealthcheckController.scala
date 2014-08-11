package controllers

import conf.HealthCheck
import play.api.mvc.{Action, Controller}

/**
 * Provides a non blocking healthcheck url for CDN healthchecks
 */
object CdnHealthcheckController extends Controller {
  def healthcheck() = Action(if (HealthCheck.isOk) Ok("OK") else ServiceUnavailable("Service Unavailable"))
}
