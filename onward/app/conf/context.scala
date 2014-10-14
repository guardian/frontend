package conf

object HealthCheck extends AllGoodHealthcheckController(
  9011,
  "/top-stories.json",
  "/most-read/society.json"
)