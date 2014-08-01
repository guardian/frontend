package controllers

import conf.AllGoodHealthcheckController
import play.api.{Mode, Play}

object HealthCheck extends AllGoodHealthcheckController(9009, "/login")