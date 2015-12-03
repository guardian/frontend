package controllers

import common._
import model._
import play.api.mvc.{Result, RequestHeader}
import services.IndexPage

object RssController extends IndexControllerCommon {
  override protected def renderFaciaFront(model: IndexPage)(implicit request: RequestHeader): Result = Cached(model.page) {
    Ok(TrailsToRss(model.page.metadata, model.trails.map(_.trail)))
      .as("text/xml; charset=utf-8")
  }
}
