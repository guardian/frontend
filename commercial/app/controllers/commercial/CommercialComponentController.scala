package controllers.commercial

import common.ExecutionContexts
import model.commercial.Context
import model.commercial.Segment
import play.api.mvc._

trait CommercialComponentController extends Controller with ExecutionContexts {

  def segment(implicit request: Request[AnyContent]) = {
    val params = request.queryString
    val section = params.get("s") map (_.head)
    val keywords = params getOrElse("k", Nil)
    val userSegments = params getOrElse("seg", Nil)
    Segment(Context(section, keywords), userSegments)
  }

}
