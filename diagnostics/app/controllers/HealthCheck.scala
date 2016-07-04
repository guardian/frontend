package controllers

import conf.AllGoodCachedHealthCheck

class HealthCheck extends AllGoodCachedHealthCheck(9006, "/robots.txt")
