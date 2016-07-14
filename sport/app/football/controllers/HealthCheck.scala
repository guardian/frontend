package football.controllers

import conf.{AllGoodCachedHealthCheck, ExpiringSingleHealthCheck}

class HealthCheck extends AllGoodCachedHealthCheck(
  9013,
  ExpiringSingleHealthCheck("/football/live"),
  ExpiringSingleHealthCheck("/football/premierleague/results")
)
