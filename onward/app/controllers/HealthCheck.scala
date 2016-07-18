package controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}

class HealthCheck extends AllGoodCachedHealthCheck(
  9011,
  NeverExpiresSingleHealthCheck("/top-stories.json"),
  NeverExpiresSingleHealthCheck("/most-read/society.json")
)
