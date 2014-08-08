package controllers

import conf.AllGoodHealthcheckController
import play.api.mvc.Action

object HealthCheck extends AllGoodHealthcheckController(9001, "/login") {

  // Unlike other health checks, Admin is initially set to healthy, and may move into
  // an unhealthy state, which it will remain in until terminated.
  status.set(true)

  override def healthcheck() = if (!isOk) {
    Action(InternalServerError("JAXP00010001"))
  } else {
    super.healthcheck()
  }
}
