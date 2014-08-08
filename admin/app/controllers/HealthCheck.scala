package controllers

import conf.AllGoodHealthcheckController
import play.api.mvc.Action

object HealthCheck extends AllGoodHealthcheckController(9001, "/login") {

  override def healthcheck() = if (!isOk) {
    Action(InternalServerError("JAXP00010001"))
  } else {
    super.healthcheck()
  }
}
