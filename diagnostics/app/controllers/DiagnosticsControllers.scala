package controllers

import com.softwaremill.macwire._

trait DiagnosticsControllers {
  lazy val diagnosticsController = wire[DiagnosticsController]
  lazy val quizzesController = wire[QuizzesController]
}
