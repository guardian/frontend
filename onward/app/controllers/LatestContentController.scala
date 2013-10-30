package controllers

import common._
import play.api.mvc.{Action, Controller}
import model.Cached
import feed.LatestContentAgent
import play.api.libs.json._

object LatestContentController extends Controller with Logging with ExecutionContexts {

  def renderLatest() = Action { implicit request =>

    val latestContent = LatestContentAgent.latestContent(Edition(request))

    Cached(900) {
      JsonComponent("latestContent" -> JsArray(latestContent.map { content =>
          Json.obj(
            "id" -> content.id,
            "date" -> content.webPublicationDate.toString("yyyy-MM-dd'T'HH:mm:ssZ")
          )
        })
      )
    }
  }
}
