package conf

object HealthCheck extends AllGoodCachedHealthCheck(
  9014,
  "/books/harrypotter/rss"
)

trait RssHealthCheckLifeCycle extends CachedHealthCheckLifeCycle {
  override val healthCheckController = HealthCheck
}
