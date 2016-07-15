package controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}

class HealthCheck extends AllGoodCachedHealthCheck(
  9014,
  NeverExpiresSingleHealthCheck("/books/harrypotter/rss")
)
