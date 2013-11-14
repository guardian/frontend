package controllers.commercial

import play.api.mvc._
import scala.util.Random
import common.{JsonNotFound, JsonComponent}
import model.commercial.soulmates._
import model.commercial.AdAgent
import model.commercial.soulmates.Member
import model.Cached

object SoulmateAds extends Controller {

  private def action(agent: AdAgent[Member]) = Action {
    implicit request =>
      agent.matchingAds(segment) match {
        case Nil => JsonNotFound.apply()
        case members => {
          val shuffled = Random.shuffle(members)
          Cached(60)(JsonComponent(views.html.soulmates(shuffled take 5)))
        }
      }
  }

  def mixed = action {
    SoulmatesMixedAgent
  }

  def men = action {
    SoulmatesMenAgent
  }

  def women = action {
    SoulmatesWomenAgent
  }

  def gay = action {
    SoulmatesGayAgent
  }

  def lesbian = action {
    SoulmatesLesbianAgent
  }

}
