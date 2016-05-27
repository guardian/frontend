package conf

import controllers.HealthCheck

trait ArticleHealthCheckLifeCycle extends CachedHealthCheckLifeCycle {
  override val healthCheckController = HealthCheck
}
