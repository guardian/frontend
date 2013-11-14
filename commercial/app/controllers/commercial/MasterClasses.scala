package controllers.commercial

import play.api.mvc._
import common.{JsonNotFound, JsonComponent}
import model.commercial.masterclasses.MasterClassAgent
import scala.util.Random
import model.Cached

object MasterClasses extends Controller {

  def list = Action {
    implicit request =>
      MasterClassAgent.getUpcoming match {
        case Nil => JsonNotFound.apply()
        case upcoming => {
          val shuffled = Random.shuffle(upcoming)
          Cached(60)(JsonComponent(views.html.masterclasses(shuffled take 3)))
        }
      }
  }
}
