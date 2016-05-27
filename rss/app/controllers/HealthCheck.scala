package controllers

import conf.AllGoodCachedHealthCheck

object HealthCheck extends AllGoodCachedHealthCheck(
  9014,
  "/books/harrypotter/rss"
)
