package conf

object HealthCheck extends AllGoodHealthcheckController(
  9020,
  "/weather/city.json",
  "/weather/city/328328.json",
  "/weather/forecast/2532742.json"
)
