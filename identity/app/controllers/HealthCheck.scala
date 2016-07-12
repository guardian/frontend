package controllers

import conf.{AllGoodCachedHealthCheck, ExpiringSingleHealthCheck}

object HealthCheck extends AllGoodCachedHealthCheck(9010, ExpiringSingleHealthCheck("/signin"))
