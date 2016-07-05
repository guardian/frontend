package controllers

import com.softwaremill.macwire._

trait AdminJobsControllers {
  lazy val newsAlertController = wire[NewsAlertControllerImpl]
}
