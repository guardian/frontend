package controllers.commercial

import play.api.mvc._
import common.ExecutionContexts
import model.commercial.travel.OffersAgent
import scala.util.Random
import play.api.libs.ws.{Response, WS}
import scala.concurrent.Future
import model.commercial.masterclasses.{MasterClassAgent, MasterClass, MasterClassesApi}
import scala.util.Random

object MasterClasses extends Controller with ExecutionContexts {

  def all = Action {
    val upcoming: List[MasterClass] = MasterClassAgent.getUpcoming
    val display = views.html.masterclasses(Random.shuffle(upcoming).take(3))
    Ok(display)
  }
}
