package conf

object HealthCheck extends AllGoodHealthcheckController(9006, "/ab.gif")
