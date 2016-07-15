package football.controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}

class HealthCheck extends AllGoodCachedHealthCheck(
  9013,
  NeverExpiresSingleHealthCheck("/football/live"),
  NeverExpiresSingleHealthCheck("/football/premierleague/results")
)
