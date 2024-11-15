package controllers

import agents.{MostViewedAgent, DeeplyReadAgent}
import com.softwaremill.macwire._
import model.ApplicationContext
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents
import services.fronts.FrontJsonFapiLive
import services.newsletters.NewsletterSignupAgent

trait FaciaControllers {
  def frontJsonFapiLive: FrontJsonFapiLive
  def controllerComponents: ControllerComponents
  def wsClient: WSClient
  def mostViewedAgent: MostViewedAgent
  def deeplyReadAgent: DeeplyReadAgent
  def assets: Assets
  def newsletterSignupAgent: NewsletterSignupAgent
  implicit def appContext: ApplicationContext
  lazy val faciaController = wire[FaciaControllerImpl]
}
