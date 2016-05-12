package conf

object HealthCheck extends AllGoodCachedHealthCheck(
  9015,
  "/news-alert/alerts"
)

trait AdminJobsHealthCheckLifeCycle extends CachedHealthCheckLifeCycle {
  override val healthCheckController = HealthCheck
}
