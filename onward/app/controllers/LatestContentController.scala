package controllers

import common._
import play.api.mvc.{Controller, WebSocket}
import play.api.libs.json._

object LatestContentController extends Controller with Logging with ExecutionContexts {

  def recentlyPublished() = WebSocket.async[JsValue] { request =>
    services.RecentlyPublished.subscribe()
  }
}
