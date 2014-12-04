package conf

object HealthCheck extends AllGoodHealthcheckController(
  9002,
  "/books/harrypotter/rss"
)
