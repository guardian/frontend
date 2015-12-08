package controllers

import common._
import model._
import play.api.mvc.{Result, RequestHeader}
import services.IndexPage

object IndexController extends IndexControllerCommon {
  protected def renderFaciaFront(model: IndexPage)(implicit request: RequestHeader): Result = {
    Cached(model.page) {
      if (request.isRss)
        Ok(TrailsToRss(model.page.metadata, model.trails.map(_.trail)))
          .as("text/xml; charset=utf-8")
      else if (request.isJson)
        JsonComponent(
          "html" -> views.html.fragments.indexBody(model)
        )
      else
        Ok(views.html.index(model))
    }
  }
}
