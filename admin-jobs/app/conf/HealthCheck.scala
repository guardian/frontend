package conf

object HealthCheck extends AllGoodHealthcheckController(
  9015,
  "/news-alert/alerts"
)
