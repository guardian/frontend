package controllers

import com.softwaremill.macwire._
import controllers.front.FrontJsonFapiLive
import model.ApplicationContext
import play.api.Environment

trait FaciaControllers {
  def frontJsonFapiLive: FrontJsonFapiLive
  implicit def appContext: ApplicationContext
  lazy val dedupedController = wire[DedupedController]
  lazy val faciaController = wire[FaciaControllerImpl]
}
