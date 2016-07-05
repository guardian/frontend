package controllers

import conf.{AllGoodCachedHealthCheck, ExpiringSingleHealthCheck}

class HealthCheck extends AllGoodCachedHealthCheck(9007, ExpiringSingleHealthCheck("/discussion/p/37v3a"))
