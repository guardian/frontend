package controllers.commercial

import play.api.mvc._
import scala.util.Random
import common.{JsonComponent, ExecutionContexts}
import model.commercial.soulmates.SoulmatesAgent

object SoulmateAds extends Controller with ExecutionContexts with ExpectsSegmentInRequests {

  def popular = Action {
    implicit request =>
      val popular = SoulmatesAgent.matchingAds(segment)
      if (popular.isEmpty) {
        Ok("No members") withHeaders ("Cache-Control" -> "max-age=60")
      } else {
        val shuffled = Random.shuffle(popular)
        JsonComponent {
          "html" -> views.html.soulmates(shuffled take 5)
        } withHeaders ("Cache-Control" -> "max-age=60")
      }
  }

}
