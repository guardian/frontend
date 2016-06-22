package controllers

import conf.AllGoodCachedHealthCheck

class HealthCheck extends AllGoodCachedHealthCheck(9001, "/login")
