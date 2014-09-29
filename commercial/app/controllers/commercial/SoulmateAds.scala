package controllers.commercial

import common.{JsonNotFound, JsonComponent}
import model.commercial.soulmates._
import model.{NoCache, Cached}
import performance.MemcachedAction
import play.api.mvc._
import play.twirl.api.Html
import scala.concurrent.Future

object SoulmateAds extends Controller {

  object lowRelevance extends Relevance[Member] {
    def view(soulmates: Seq[Member])(implicit request: RequestHeader): Html =
      views.html.soulmates(soulmates)
  }
  object lowRelevanceV2 extends Relevance[Member] {
    override def view(soulmates: Seq[Member])(implicit request: RequestHeader): Html = views.html.soulmatesV2(soulmates)
  }

  object highRelevance extends Relevance[Member] {
    override def view(soulmates: Seq[Member])(implicit request: RequestHeader): Html =
      views.html.soulmatesHigh(soulmates)
  }

  private def renderMixed(relevance: Relevance[Member], format: Format) = MemcachedAction { implicit request =>
    Future.successful {
      SoulmatesAggregatingAgent.sampleMembers(segment) match {
        case Nil => NoCache(format.nilResult)
        case members => Cached(componentMaxAge) {
          format.result(relevance.view(members))
        }
      }
    }
  }

  def mixedLowHtml = renderMixed(lowRelevance, htmlFormat)
  def mixedLowJson = renderMixed(lowRelevance, jsonFormat)
  def mixedLowHtmlV2 = renderMixed(lowRelevanceV2, htmlFormat)
  def mixedLowJsonV2 = renderMixed(lowRelevanceV2, jsonFormat)

  def mixedHighHtml = renderMixed(highRelevance, htmlFormat)
  def mixedHighJson = renderMixed(highRelevance, jsonFormat)
}
