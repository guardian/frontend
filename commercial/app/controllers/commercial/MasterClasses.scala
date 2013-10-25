package controllers.commercial

import play.api.mvc._
import common.ExecutionContexts
import model.commercial.travel.OffersAgent
import scala.util.Random
import play.api.libs.ws.{Response, WS}
import scala.concurrent.Future

object MasterClasses extends Controller with ExecutionContexts {

  def all = Action {

    Ok("List of Masterclasses goes here")
  }
}
