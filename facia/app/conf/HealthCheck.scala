package conf

import model.NoCache
import play.api.mvc.Action

object HealthCheckController extends CachedHealthCheckController {
  override val paths = Seq("/uk/business")
  override val port = 9008
  override def healthCheck() = healthCheckAll()
}

trait FaciaHealthCheckLifeCycle extends CachedHealthCheckLifeCycle {
  override val healthCheckController = HealthCheckController
}
