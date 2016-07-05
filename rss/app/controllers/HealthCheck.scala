package controllers

import conf.{AllGoodCachedHealthCheck, ExpiringSingleHealthCheck}

object HealthCheck extends AllGoodCachedHealthCheck(
  9014,
  ExpiringSingleHealthCheck("/books/harrypotter/rss")
)
