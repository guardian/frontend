package controllers

import common._
import play.api.mvc.{Action, Controller, WebSocket}
import model.Cached
import feed.LatestContentAgent
import play.api.libs.json._

object LatestContentController extends Controller with Logging with ExecutionContexts {

  def renderLatest() = Action { implicit request =>

    val latestContent = LatestContentAgent.latestContent(Edition(request))

    latestContent match {

      case Some(content) => Cached(900) {
        JsonComponent("latestContent" ->
          Json.obj(
            "id" -> content.id,
            "date" -> content.webPublicationDate.toString("yyyy-MM-dd'T'HH:mm:ssZ")
          )
        )
      }

      case _ => NotFound
    }
  }

  def recentlyPublished() = WebSocket.async[JsValue] { request =>
    services.RecentlyPublished.subscribe()
  }
}
