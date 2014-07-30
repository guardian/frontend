package controllers

import java.util.concurrent.atomic.AtomicBoolean

import conf.AllGoodHealthcheckController
import play.api.{Mode, Play}
import play.api.mvc.Action

object HealthCheck extends AllGoodHealthcheckController("/login") {

  private val status = new AtomicBoolean(true)
  def isOK = status.get
  def setUnhealthy(){ status.set(false) }

  override def healthcheck() = if (!isOK) {
    Action(InternalServerError("JAXP00010001"))
  } else {
    super.healthcheck()
  }

  val testPort = 9003

  override lazy val port = {
    Play.current.mode match {
      case Mode.Test => testPort
      case _ => 9000
    }
  }
}
