package conf

object HealthCheck extends AllGoodCachedHealthCheck(9003, "/404/www.theguardian.com/Adzip/adzip-fb.html")

trait ArchiveHealthCheckLifeCycle extends CachedHealthCheckLifeCycle {
  override val healthCheckController = HealthCheck
}
