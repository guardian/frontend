package controllers.commercial

import model.commercial.masterclasses.{MasterClass, MasterClassAgent}
import model.{NoCache, Cached}
import performance.MemcachedAction
import play.api.mvc._
import play.api.templates.Html
import scala.concurrent.Future

object MasterClasses extends Controller {

  implicit val codec = Codec.utf_8

  object lowRelevance extends Relevance[MasterClass] {
    def view(masterclasses: Seq[MasterClass])(implicit request: RequestHeader): Html =
      views.html.masterclasses(masterclasses)
  }

  object highRelevance extends Relevance[MasterClass] {
    def view(masterclasses: Seq[MasterClass])(implicit request: RequestHeader): Html =
      views.html.masterclassesHigh(masterclasses)
  }

  private def renderMasterclasses(relevance: Relevance[MasterClass], format: Format) =
    MemcachedAction { implicit request =>
      Future.successful {
        MasterClassAgent.adsTargetedAt(segment) match {
          case Nil => NoCache(format.nilResult)
          case masterclasses => Cached(componentMaxAge) {
            format.result(relevance.view(masterclasses take 4))
          }
        }
      }
    }

  def masterclassesLowHtml = renderMasterclasses(lowRelevance, htmlFormat)
  def masterclassesLowJson = renderMasterclasses(lowRelevance, jsonFormat)

  def masterclassesHighHtml = renderMasterclasses(highRelevance, htmlFormat)
  def masterclassesHighJson = renderMasterclasses(highRelevance, jsonFormat)
}
