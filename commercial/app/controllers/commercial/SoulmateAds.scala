package controllers.commercial

import play.api.mvc._
import scala.util.Random
import common.{JsonComponent, ExecutionContexts}
import model.commercial.soulmates._
import model.commercial.AdAgent
import model.commercial.soulmates.Member

object SoulmateAds extends Controller with ExecutionContexts with ExpectsSegmentInRequests {

  private def action(agent: AdAgent[Member]) = Action {
    implicit request =>
      val matching = agent.matchingAds(segment)
      if (matching.isEmpty) {
        Ok("No members") withHeaders ("Cache-Control" -> "max-age=60")
      } else {
        val shuffled = Random.shuffle(matching)
        JsonComponent {
          "html" -> views.html.soulmates(shuffled take 5)
        } withHeaders ("Cache-Control" -> "max-age=60")
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
