package controllers

import conf.{AllGoodCachedHealthCheck, CachedHealthCheckLifeCycle}

object HealthCheck extends AllGoodCachedHealthCheck(
 9017,
 "/world/2012/sep/11/barcelona-march-catalan-independence"
)

trait PreviewHealthCheckLifeCycle extends CachedHealthCheckLifeCycle {
  override val healthCheckController = HealthCheck
}
