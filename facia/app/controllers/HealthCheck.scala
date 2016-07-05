package controllers

import conf.{AllGoodCachedHealthCheck, ExpiringSingleHealthCheck}

object HealthCheck extends AllGoodCachedHealthCheck(9008, ExpiringSingleHealthCheck("/uk/business"))
