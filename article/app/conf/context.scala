package conf

object HealthCheck extends AllGoodCachedHealthCheck(9004, "/world/2012/sep/11/barcelona-march-catalan-independence")

trait ArticleHealthCheckLifeCycle extends CachedHealthCheckLifeCycle {
  override val healthCheckController = HealthCheck
}
