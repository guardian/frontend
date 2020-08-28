package commercial

import common.{JsonNotFound, JsonComponent}
import _root_.model.Cached.RevalidatableResult
import model.{Context, Segment}
import play.api.mvc._
import scala.concurrent.duration._
import play.twirl.api.Html

package object controllers {

  val componentMaxAge = 15.minutes

  /*  if a service goes down or an agent becomes unavailable, we don't want each user request to
      hit frontend; allow Fastly to briefly cache Nil results
   */
  val componentNilMaxAge = 5.seconds

  def segment(implicit request: RequestHeader): Segment = {
    val params = request.queryString
    val section = params.get("s") map (_.head)
    val keywords = params getOrElse ("k", Nil)
    val userSegments = params getOrElse ("seg", Nil)
    Segment(Context(section, keywords), userSegments)
  }

  def specificId(implicit request: RequestHeader): Option[String] = request.queryString.get("t").map(_.head)
  def specificIds(implicit request: RequestHeader): Seq[String] = request.queryString.getOrElse("t", Nil)

  trait Relevance[T] {
    def view(ads: Seq[T])(implicit request: RequestHeader): Html
  }

  trait Format {
    def nilResult(implicit request: RequestHeader): RevalidatableResult
    def result(view: Html)(implicit request: RequestHeader): RevalidatableResult
  }

  object htmlFormat extends Format {
    override def nilResult(implicit request: RequestHeader): RevalidatableResult =
      RevalidatableResult(Results.NotFound, "")
    override def result(view: Html)(implicit request: RequestHeader): RevalidatableResult = RevalidatableResult.Ok(view)
  }

  object jsonFormat extends Format {
    override def nilResult(implicit request: RequestHeader): RevalidatableResult = JsonNotFound.apply()
    override def result(view: Html)(implicit request: RequestHeader): RevalidatableResult = JsonComponent(view)
  }
}
