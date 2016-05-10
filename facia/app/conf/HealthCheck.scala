package conf

object HealthCheckController extends CachedHealthCheckController {
  override val paths = Seq("/uk/business")
  override val testPort = 9008
  override def healthCheck() = healthCheckAll()
}

trait FaciaHealthCheckLifeCycle extends CachedHealthCheckLifeCycle {
  override val healthCheckController = HealthCheckController
}
