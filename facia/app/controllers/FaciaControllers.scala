package controllers

import com.softwaremill.macwire._
import controllers.front.FrontJsonFapiLive
import play.api.Environment

trait FaciaControllers {
  def frontJsonFapiLive: FrontJsonFapiLive
  implicit def environment: Environment
  lazy val dedupedController = wire[DedupedController]
  lazy val faciaController = wire[FaciaControllerImpl]
}
