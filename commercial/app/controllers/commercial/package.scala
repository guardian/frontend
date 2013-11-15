package controllers

import model.commercial.{Context, Segment}
import play.api.mvc._
import common.JsonComponent
import play.api.libs.json.JsObject

package object commercial {

  def segment(implicit request: Request[AnyContent]) = {
    val params = request.queryString
    val section = params.get("s") map (_.head)
    val keywords = params getOrElse("k", Nil)
    val userSegments = params getOrElse("seg", Nil)
    Segment(Context(section, keywords), userSegments)
  }

  def noMatchingSegmentsResult(implicit request: Request[AnyContent]) = JsonComponent {
    JsObject(Nil)
  } withHeaders ("Cache-Control" -> "max-age=60")

}
