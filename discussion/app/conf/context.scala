package conf

import controllers.HealthCheck


trait DiscussionHealthCheckLifeCycle extends CachedHealthCheckLifeCycle {
  override val healthCheckController = HealthCheck
}
