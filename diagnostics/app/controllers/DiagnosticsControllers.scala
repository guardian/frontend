package controllers

import com.softwaremill.macwire._
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents

trait DiagnosticsControllers {
  def wsClient: WSClient
  def controllerComponents: ControllerComponents

  lazy val diagnosticsController = wire[DiagnosticsController]
}
