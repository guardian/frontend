package controllers.commercial

import model.commercial.soulmates._
import model.{Cached, NoCache}
import performance.MemcachedAction
import play.api.mvc._
import play.twirl.api.Html

import scala.concurrent.Future

object SoulmateAds extends Controller with implicits.Requests {

  object lowRelevance extends Relevance[Member] {
    def view(soulmates: Seq[Member])(implicit request: RequestHeader): Html = {
      val clickMacro = request.getParameter("clickMacro")
      val omnitureId = request.getParameter("omnitureId")
      views.html.soulmates(soulmates, omnitureId, clickMacro)
    }
  }

  object highRelevance extends Relevance[Member] {
    override def view(soulmates: Seq[Member])(implicit request: RequestHeader): Html = {
      val clickMacro = request.getParameter("clickMacro")
      val omnitureId = request.getParameter("omnitureId")
      views.html.soulmatesHigh(soulmates, omnitureId, clickMacro)
    }
  }

  private def renderMixed(relevance: Relevance[Member], format: Format) = MemcachedAction { implicit request =>
    Future.successful {
      SoulmatesAggregatingAgent.sampleMembers match {
        case Nil => NoCache(format.nilResult)
        case members => Cached(componentMaxAge) {
          format.result(relevance.view(members))
        }
      }
    }
  }

  def mixedLowHtml = renderMixed(lowRelevance, htmlFormat)
  def mixedLowJson = renderMixed(lowRelevance, jsonFormat)

  def mixedHighHtml = renderMixed(highRelevance, htmlFormat)
  def mixedHighJson = renderMixed(highRelevance, jsonFormat)
}
