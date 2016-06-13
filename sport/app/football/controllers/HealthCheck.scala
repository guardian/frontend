package football.controllers

import conf.AllGoodCachedHealthCheck

object HealthCheck extends AllGoodCachedHealthCheck(
  9013,
  "/football/live",
  "/football/premierleague/results"
)
