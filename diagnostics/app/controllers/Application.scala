package controllers

import common.Logging
import play.api.mvc._

object Application extends Controller with Logging {
  // Management doesn't start in DEV until an application URL is hit
  def front() = Action { Ok("OK") }
}
