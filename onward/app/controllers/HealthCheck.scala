package controllers

import conf.{AllGoodCachedHealthCheck, ExpiringSingleHealthCheck}

class HealthCheck extends AllGoodCachedHealthCheck(
  9011,
  ExpiringSingleHealthCheck("/top-stories.json"),
  ExpiringSingleHealthCheck("/most-read/society.json")
)
