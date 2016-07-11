package controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}

class HealthCheck extends AllGoodCachedHealthCheck(9007, NeverExpiresSingleHealthCheck("/discussion/p/37v3a"))
