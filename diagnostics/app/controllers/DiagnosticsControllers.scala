package controllers

import com.softwaremill.macwire._
import play.api.libs.ws.WSClient

trait DiagnosticsControllers {
  def wsClient: WSClient

  lazy val diagnosticsController = wire[DiagnosticsController]
  lazy val quizzesController = wire[QuizzesController]
  lazy val commercialPreflightController = wire[CommercialPreflightController]
}
