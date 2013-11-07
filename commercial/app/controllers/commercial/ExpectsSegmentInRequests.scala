package controllers.commercial

import model.commercial.Context
import model.commercial.Segment
import play.api.mvc._

trait ExpectsSegmentInRequests {

  def segment(implicit request: Request[AnyContent]) = {
    val params = request.queryString
    val section = params.get("s") map (_.head)
    val keywords = params getOrElse("k", Nil)
    val userSegments = params getOrElse("seg", Nil)
    Segment(Context(section, keywords), userSegments)
  }

}
