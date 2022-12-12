package controllers

import agents.MostViewedAgent
import com.softwaremill.macwire._
import model.ApplicationContext
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents
import services.fronts.FrontJsonFapiLive

trait FaciaControllers {
  def frontJsonFapiLive: FrontJsonFapiLive
  def controllerComponents: ControllerComponents
  def wsClient: WSClient
  def mostViewedAgent: MostViewedAgent
  implicit def appContext: ApplicationContext
  lazy val faciaController = wire[FaciaControllerImpl]
}
