package controllers.fronts

import common._
import play.api.mvc.{Action, Controller}
import controllers.{AuthAction, AuthLogging}
import play.api.libs.json.Json.toJson
import play.api.Play.current
import play.api.libs.concurrent.Akka
import tools.Store

object TopStoriesController extends Controller with AuthLogging with Logging with ExecutionContexts {

  def read() = AuthAction{ request =>
    val promiseOfTopStories = Akka future {
      Store.getTopStories
    }
    Async {
      promiseOfTopStories.map { topStories =>
        Ok(topStories.getOrElse("")).as("application/json")
      }
    }
  }
  
  def update() = AuthAction{ request =>
    val promiseOfSavedTopStories = Akka.future {
      Store.putTopStories(request.body.asJson.map(_.toString).getOrElse(""))
    }
    Async {
      promiseOfSavedTopStories.map { savedTopStories =>
        Ok(status("updated")).as("application/json")
      }
    }

  }

  def status(msg: String) = toJson(Map("status" -> msg))
  
}
