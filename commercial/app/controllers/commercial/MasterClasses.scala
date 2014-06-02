package controllers.commercial

import play.api.mvc._
import common.{JsonNotFound, JsonComponent}
import model.commercial.masterclasses.MasterClassAgent
import model.Cached

object MasterClasses extends Controller {

  implicit val codec = Codec.utf_8

  def renderMasterclass = Action {
    implicit request =>
      MasterClassAgent.adsTargetedAt(segment) match {
        case Nil => NotFound
        case upcoming =>
          Cached(60)(Ok(views.html.masterclasses(upcoming take 4)))
      }
  }

  def list = Action {
    implicit request =>
      MasterClassAgent.adsTargetedAt(segment) match {
        case Nil => JsonNotFound.apply()
        case upcoming =>
          Cached(60)(JsonComponent(views.html.masterclasses(upcoming take 4)))
      }
  }

  def renderMasterclassHigh = Action {
    implicit request =>
      MasterClassAgent.adsTargetedAt(segment) match {
        case Nil => NotFound
        case upcoming =>
          Cached(60)(Ok(views.html.masterclassesHigh(upcoming take 4)))
      }
  }

  def listHigh = Action {
    implicit request =>
      MasterClassAgent.adsTargetedAt(segment) match {
        case Nil => JsonNotFound.apply()
        case upcoming =>
          Cached(60)(JsonComponent(views.html.masterclassesHigh(upcoming take 4)))
      }
  }

}
