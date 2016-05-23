package conf

object HealthCheck extends AnyGoodCachedHealthCheck(
  9005,
  "/commercial/soulmates/mixed.json",
  "/commercial/masterclasses.json",
  "/commercial/travel/offers.json",
  "/commercial/jobs.json",
  "/commercial/money/bestbuys.json",
  "/commercial/books/books.json"
)

trait CommercialHealthCheckLifeCycle extends CachedHealthCheckLifeCycle {
  override val healthCheckController = HealthCheck
}
