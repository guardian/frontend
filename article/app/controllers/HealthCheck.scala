package controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}

class HealthCheck extends AllGoodCachedHealthCheck(
  9004,
  NeverExpiresSingleHealthCheck("/world/2012/sep/11/barcelona-march-catalan-independence")
)
