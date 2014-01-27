package controllers

import play.api.mvc.{Action, Controller}
import common.Logging


/*
*
*  NOTE: this is temporarliy here for me to do some testing...
*
*  This will not be accessible via the router
*
*/
object StatusTestController extends Controller with Logging {

  def render(status: String, msg: String) = Action{
    log.info(s"status...... $status $msg")
    Status(status.toInt)
  }


}
