package controllers

import play.api.libs.json.Json
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import scala.io.Source

class HealthCheck(val controllerComponents: ControllerComponents) extends BaseController {

  def healthCheck(): Action[AnyContent] =
    Action {
      Ok("OK")
    }

  def tags: Action[AnyContent] = Action {
    /*
    This file is created by https://github.com/guardian/instance-tag-discovery,
    which is part of the `cdk-base` AMIgo role.
     */
    val filename = "/etc/config/tags.json"
    try {
      val content = Source.fromFile(filename)
      val tagsJson =
        try content.mkString
        finally content.close()
      Ok(Json.parse(tagsJson))
    } catch {
      case e: Exception => InternalServerError(e.getMessage)
    }
  }
}
