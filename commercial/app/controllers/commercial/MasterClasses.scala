package controllers.commercial

import model.commercial.masterclasses.{MasterClass, MasterClassAgent}
import model.{Cached, NoCache}
import performance.MemcachedAction
import play.api.mvc._

import scala.concurrent.Future

object MasterClasses extends Controller {

  implicit val codec = Codec.utf_8

  object lowRelevance extends Relevance[MasterClass] {
    def view(classes: Seq[MasterClass])(implicit request: RequestHeader) = views.html.masterclasses(classes)
  }
  object lowRelevanceV2 extends Relevance[MasterClass] {
    def view(classes: Seq[MasterClass])(implicit request: RequestHeader) = views.html.masterclassesV2(classes)
  }

  object highRelevance extends Relevance[MasterClass] {
    def view(classes: Seq[MasterClass])(implicit request: RequestHeader) = views.html.masterclassesHigh(classes)
  }
  object highRelevanceV2 extends Relevance[MasterClass] {
    def view(classes: Seq[MasterClass])(implicit request: RequestHeader) = views.html.masterclassesHighV2(classes)
  }

  private def renderMasterclasses(relevance: Relevance[MasterClass], format: Format) =
    MemcachedAction { implicit request =>
      Future.successful {
        (MasterClassAgent.specificClasses(specificIds) ++ MasterClassAgent.adsTargetedAt(segment)).distinct match {
          case Nil => NoCache(format.nilResult)
          case masterclasses => Cached(componentMaxAge) {
            format.result(relevance.view(masterclasses take 4))
          }
        }
      }
    }

  def masterclassesLowHtml = renderMasterclasses(lowRelevance, htmlFormat)
  def masterclassesLowJson = renderMasterclasses(lowRelevance, jsonFormat)
  def masterclassesLowJsonV2 = renderMasterclasses(lowRelevanceV2, jsonFormat)

  def masterclassesHighHtml = renderMasterclasses(highRelevance, htmlFormat)
  def masterclassesHighJson = renderMasterclasses(highRelevance, jsonFormat)
  def masterclassesHighJsonV2 = renderMasterclasses(highRelevanceV2, jsonFormat)
}
