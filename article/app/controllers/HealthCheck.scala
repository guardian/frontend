package controllers

import conf.AllGoodCachedHealthCheck

object HealthCheck extends AllGoodCachedHealthCheck(9004, "/world/2012/sep/11/barcelona-march-catalan-independence")
