package controllers

import com.softwaremill.macwire._
import controllers.front.FrontJsonFapiLive
import model.ApplicationContext
import play.api.mvc.ControllerComponents

trait FaciaControllers {
  def frontJsonFapiLive: FrontJsonFapiLive
  def controllerComponents: ControllerComponents
  implicit def appContext: ApplicationContext
  lazy val dedupedController = wire[DedupedController]
  lazy val faciaController = wire[FaciaControllerImpl]
}
