package controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}

class HealthCheck extends AllGoodCachedHealthCheck(9003, NeverExpiresSingleHealthCheck("/404/www.theguardian.com/Adzip/adzip-fb.html"))
