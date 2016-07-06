package controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}

object HealthCheck extends AllGoodCachedHealthCheck(9007, NeverExpiresSingleHealthCheck("/discussion/p/37v3a"))
