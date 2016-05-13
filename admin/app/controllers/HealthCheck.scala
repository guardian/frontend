package controllers

import conf.{AllGoodCachedHealthCheck, CachedHealthCheckLifeCycle}

object HealthCheck extends AllGoodCachedHealthCheck(9001, "/login")

trait AdminHealthCheckLifeCycle extends CachedHealthCheckLifeCycle {
  override val healthCheckController = HealthCheck
}
