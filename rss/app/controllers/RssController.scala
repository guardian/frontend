package controllers

import common._
import model.Cached.RevalidatableResult
import model._
import play.api.mvc.{Result, RequestHeader}
import services.IndexPage

object RssController extends IndexControllerCommon {
  override protected def renderFaciaFront(model: IndexPage)(implicit request: RequestHeader): Result = Cached(model.page) {
    val body = TrailsToRss(model.page.metadata, model.trails.map(_.trail))
    RevalidatableResult(Ok(body).as("text/xml; charset=utf-8"), body)
  }
}
