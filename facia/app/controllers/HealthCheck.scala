package controllers

import conf.{AllGoodCachedHealthCheck, ExpiringSingleHealthCheck}

class HealthCheck extends AllGoodCachedHealthCheck(9008, ExpiringSingleHealthCheck("/uk/business"))
