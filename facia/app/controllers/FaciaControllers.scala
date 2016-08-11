package controllers

import com.softwaremill.macwire._
import controllers.front.FrontJsonFapiLive

trait FaciaControllers {
  def frontJsonFapiLive: FrontJsonFapiLive
  lazy val dedupedController = wire[DedupedController]
  lazy val faciaController = wire[FaciaControllerImpl]
}
