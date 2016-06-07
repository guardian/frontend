package controllers

import conf.AllGoodCachedHealthCheck

object HealthCheck extends AllGoodCachedHealthCheck(9007, "/discussion/p/37v3a")
