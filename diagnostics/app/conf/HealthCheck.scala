package conf

object HealthCheck extends AllGoodCachedHealthCheck(9006, "/robots.txt")
