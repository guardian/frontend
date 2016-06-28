package controllers

import common._
import model.Cached.RevalidatableResult
import model._
import play.api.mvc.{Result, RequestHeader}
import services.IndexPage

class IndexController extends IndexControllerCommon {
  protected def renderFaciaFront(model: IndexPage)(implicit request: RequestHeader): Result = {
    Cached(model.page) {
      if (request.isRss) {
        val body = TrailsToRss(model.page.metadata, model.trails.map(_.trail))
        RevalidatableResult(Ok(body).as("text/xml; charset=utf-8"), body)
      } else if (request.isJson)
        JsonComponent(
          "html" -> views.html.fragments.indexBody(model)
        )
      else
        RevalidatableResult.Ok(views.html.index(model))
    }
  }
}

object IndexController extends IndexController
