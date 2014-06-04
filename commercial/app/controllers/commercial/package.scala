package controllers

import model.commercial.{Context, Segment}
import play.api.mvc._
import scala.concurrent.duration._

package object commercial {

  val componentMaxAge = 5.minutes

  def segment(implicit request: RequestHeader) = {
    val params = request.queryString
    val section = params.get("s") map (_.head)
    val keywords = params getOrElse("k", Nil)
    val userSegments = params getOrElse("seg", Nil)
    Segment(Context(section, keywords), userSegments)
  }
}
