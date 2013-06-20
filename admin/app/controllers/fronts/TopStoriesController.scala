package controllers.fronts

import common._
import play.api.mvc.{Action, Controller}
import controllers.{AuthAction, AuthLogging}
import play.api.libs.json.Json.toJson
import tools.S3

object TopStoriesController extends Controller with AuthLogging with Logging  {

  def read() = AuthAction{ request =>
    val topStories = request.body.asJson.map(_.toString)
    Ok(
      S3.getTopStories.getOrElse("")
    ).as("application/json")
  }
  
  def update() = AuthAction{ request =>
    S3.putTopStories(request.body.asJson.map(_.toString).getOrElse(""))
    Ok(status("updated")).as("application/json")
  }

  def status(msg: String) = toJson(Map("status" -> msg))
  
}
