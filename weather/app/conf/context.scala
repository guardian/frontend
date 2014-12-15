package conf

object HealthCheck extends AllGoodHealthcheckController(
  9020,
  "/weather/city.json",
  "/weather/city/sydney.json"
)
