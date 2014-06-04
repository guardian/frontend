package controllers.commercial

import common.{JsonNotFound, JsonComponent}
import model.Cached
import model.commercial.masterclasses.{MasterClass, MasterClassAgent}
import play.api.mvc._

object MasterClasses extends Controller {

  implicit val codec = Codec.utf_8

  private def renderMasterclassAction(nilResult: RequestHeader => Result)
                                     (result: Seq[MasterClass] => RequestHeader => SimpleResult) = Action {
    implicit request =>
      MasterClassAgent.adsTargetedAt(segment) match {
        case Nil => nilResult(request)
        case masterClasses =>
          Cached(60) {
            result(masterClasses take 4)(request)
          }
      }
  }

  def renderMasterclass = renderMasterclassAction(implicit request => NotFound) {
    masterClasses => implicit request =>
      Ok(views.html.masterclasses(masterClasses))
  }

  def list = renderMasterclassAction(implicit request => JsonNotFound.apply()(request)) {
    masterClasses => implicit request =>
      JsonComponent(views.html.masterclasses(masterClasses))
  }

  def renderMasterclassHigh = renderMasterclassAction(implicit request => NotFound) {
    masterClasses => implicit request =>
      Ok(views.html.masterclassesHigh(masterClasses))
  }

  def listHigh = renderMasterclassAction(implicit request => JsonNotFound.apply()(request)) {
    masterClasses => implicit request =>
      JsonComponent(views.html.masterclassesHigh(masterClasses))
  }
}
