package conf

import model.NoCache
import play.api.mvc.Action

object HealthCheck extends AllGoodHealthcheckController(9008, "/uk") {
  def cdnHealthcheck = Action{ request =>
    NoCache(if (isOk) Ok("OK") else ServiceUnavailable("Service Unavailable"))
  }
}
