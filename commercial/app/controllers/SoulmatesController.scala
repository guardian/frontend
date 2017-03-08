package commercial.controllers

import common.JsonComponent
import commercial.model.merchandise.soulmates.{SoulmatesAgent, Sample}
import commercial.model.merchandise.soulmates.SoulmatesAgent.{menAgent, newMenAgent, newWomenAgent, womenAgent}
import commercial.model.merchandise.Member
import model.Cached
import play.api.mvc._

import scala.concurrent.duration._

class SoulmatesController extends Controller with implicits.Requests {

  private def soulmatesSample(groupName: String): Seq[Member] = {

    def take3(agent: SoulmatesAgent) = agent.sample().take(3)

    groupName match {
      case "mixed" => {
        val members = take3(womenAgent) ++ take3(menAgent)
        Sample.default(members)
      }
      case "mixednew" => {
        val members = take3(newWomenAgent) ++ take3(newMenAgent)
        Sample.default(members)
      }
      case _ => SoulmatesAgent.sample(groupName)
    }
  }

  def getSoulmates() = Action { implicit request =>
    specificId match {
      case Some(feed) => Cached(60.seconds) { JsonComponent(soulmatesSample(feed)) }
      case None => Cached(componentNilMaxAge){ jsonFormat.nilResult }
    }
  }
}
