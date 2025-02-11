package commercial.controllers

import common.JsonComponent
import common.dfp.DfpAgent
import model.{NoCache}
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.duration._
/*
  This method sets a known cookie that we can test exists to determine if third-party cookies are enabled.
 */
class ThirdPartyCookieTestController(val controllerComponents: ControllerComponents)
    extends BaseController
    with implicits.Requests {

  def setCookie: Action[AnyContent] =
    Action { implicit request =>
      val cookie = Cookie("canihascookie", "yes", maxAge = Some(1.day.toSeconds.toInt), httpOnly = false)
      val result = Ok("{}").withCookies(cookie)
      NoCache(result)
    }
}
