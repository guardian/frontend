package controllers

import conf.{AllGoodCachedHealthCheck, ExpiringSingleHealthCheck}

class HealthCheck extends AllGoodCachedHealthCheck(
 9017,
 ExpiringSingleHealthCheck("/world/2012/sep/11/barcelona-march-catalan-independence")
)
