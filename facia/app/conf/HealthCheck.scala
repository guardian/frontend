package conf

import model.NoCache
import play.api.mvc.Action

object HealthCheck extends AllGoodHealthcheckController(9008, "/uk") {
  def cdnHealthcheck = Action{ request =>
    NoCache(if (isOk) Ok("OK") else ServiceUnavailable("Service Unavailable"))
  }
}

object HealthCheckController extends CachedHealthCheckController {
  override val paths = Seq("/uk/business")
  override val port = 9008
  override def healthCheck() = healthCheckAll()
}

trait FaciaHealthCheckLifeCycle extends CachedHealthCheckLifeCycle {
  override val healthCheckController = HealthCheckController
}
