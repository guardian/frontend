package conf

object HealthCheck extends AllGoodCachedHealthCheck(
  9011,
  "/top-stories.json",
  "/most-read/society.json"
)

trait OnwardHealthCheckLifeCycle extends CachedHealthCheckLifeCycle {
  override val healthCheckController = HealthCheck
}
