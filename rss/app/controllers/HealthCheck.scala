package controllers

import conf.{AllGoodCachedHealthCheck, ExpiringSingleHealthCheck}

class HealthCheck extends AllGoodCachedHealthCheck(
  9014,
  ExpiringSingleHealthCheck("/books/harrypotter/rss")
)
