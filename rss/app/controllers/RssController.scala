package controllers

import common._
import model._
import play.api.mvc.{Result, RequestHeader, Controller}
import services.IndexPage

object RssController extends IndexControllerCommon {
  override protected def renderFaciaFront(model: IndexPage)(implicit request: RequestHeader): Result = ???
}
