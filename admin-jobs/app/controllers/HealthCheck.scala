package controllers

import conf.AllGoodCachedHealthCheck

class HealthCheck extends AllGoodCachedHealthCheck(
  9015,
  "/news-alert/alerts"
)
