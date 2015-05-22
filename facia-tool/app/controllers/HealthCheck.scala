package controllers

import conf.AllGoodHealthcheckController

object HealthCheck extends AllGoodHealthcheckController(9009, "/login")