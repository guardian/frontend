package controllers

import conf.AllGoodHealthcheckController
import play.api.{Mode, Play}

object HealthCheck extends AllGoodHealthcheckController("/login") {
  val testPort = 9009

  override lazy val port = {
    Play.current.mode match {
      case Mode.Test => testPort
      case _ => 9000
    }
  }
}