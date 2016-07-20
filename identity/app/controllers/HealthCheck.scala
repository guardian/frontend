package controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}

class HealthCheck extends AllGoodCachedHealthCheck(9010, NeverExpiresSingleHealthCheck("/signin"))
