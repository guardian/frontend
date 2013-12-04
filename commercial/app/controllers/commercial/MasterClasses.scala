package controllers.commercial

import play.api.mvc._
import common.{JsonNotFound, JsonComponent}
import model.commercial.masterclasses.MasterClassAgent
import model.Cached

object MasterClasses extends Controller {

  implicit val codec = Codec.utf_8

  def renderMasterclass = Action {
    implicit request =>
      MasterClassAgent.getUpcoming match {
        case Nil => NotFound
        case upcoming => {
          Cached(60)(Ok(views.html.masterclasses(upcoming take 3)))
        }
      }
  }

  def list = Action {
    implicit request =>
      MasterClassAgent.getUpcoming match {
        case Nil => JsonNotFound.apply()
        case upcoming => {
          Cached(60)(JsonComponent(views.html.masterclasses(upcoming take 3)))
        }
      }
  }
}
