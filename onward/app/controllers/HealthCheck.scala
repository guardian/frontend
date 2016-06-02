package controllers

import conf.AllGoodCachedHealthCheck

object HealthCheck extends AllGoodCachedHealthCheck(
  9011,
  "/top-stories.json",
  "/most-read/society.json"
)
