package conf

object HealthCheck extends AllGoodHealthcheckController(
  9014,
  "/books/harrypotter/rss"
)
