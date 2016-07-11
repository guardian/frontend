package controllers

import conf.{AllGoodCachedHealthCheck, ExpiringSingleHealthCheck}

class HealthCheck extends AllGoodCachedHealthCheck(9003, ExpiringSingleHealthCheck("/404/www.theguardian.com/Adzip/adzip-fb.html"))
