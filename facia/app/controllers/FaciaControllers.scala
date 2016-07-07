package controllers

import com.softwaremill.macwire._

trait FaciaControllers {
  lazy val dedupedController = wire[DedupedController]
  lazy val faciaController = wire[FaciaControllerImpl]
}
