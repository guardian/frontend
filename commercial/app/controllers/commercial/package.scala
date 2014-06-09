package controllers

import common.{JsonNotFound, JsonComponent}
import model.commercial.{Context, Segment}
import play.api.mvc._
import scala.concurrent.duration._
import play.api.templates.Html

package object commercial {

  val componentMaxAge = 5.minutes

  def segment(implicit request: RequestHeader) = {
    val params = request.queryString
    val section = params.get("s") map (_.head)
    val keywords = params getOrElse("k", Nil)
    val userSegments = params getOrElse("seg", Nil)
    Segment(Context(section, keywords), userSegments)
  }

  def specificIds(implicit request: RequestHeader) = {
    request.queryString.getOrElse("t", Nil).reverse
  }

  trait Relevance[T] {
    def view(ads: Seq[T])(implicit request: RequestHeader): Html
  }

  trait Format {
    def nilResult(implicit request: RequestHeader): SimpleResult
    def result(view: Html)(implicit request: RequestHeader): SimpleResult
  }

  object htmlFormat extends Format {
    override def nilResult(implicit request: RequestHeader): SimpleResult = Results.NotFound
    override def result(view: Html)(implicit request: RequestHeader): SimpleResult = Results.Ok(view)
  }

  object jsonFormat extends Format {
    override def nilResult(implicit request: RequestHeader): SimpleResult = JsonNotFound.apply()
    override def result(view: Html)(implicit request: RequestHeader): SimpleResult = JsonComponent(view)
  }
}
