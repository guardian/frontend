package controllers

import common._
import model.{Audio, Cached}
import play.api.mvc.{RequestHeader, Controller, Action}
import feed.MostViewedAudioAgent
import views.support.TemplateDeduping

object MostViewedAudioController extends Controller with Logging with ExecutionContexts {

  private implicit def getTemplateDedupingInstance: TemplateDeduping = TemplateDeduping()

  def renderMostViewed() = Action { implicit request =>
    getMostViewedAudio match {
      case Nil => Cached(60) { JsonNotFound() }
      case audio => Cached(900) { renderMostViewedAudio(audio) }
    }
  }

  private def getMostViewedAudio()(implicit request: RequestHeader): Seq[Audio] = {
    val size = request.getQueryString("size").getOrElse("4").toInt
    MostViewedAudioAgent.mostViewedAudio().take(size)
  }

  private def renderMostViewedAudio(audios: Seq[Audio])(implicit request: RequestHeader) = Cached(900) {

    val html = views.html.fragments.mostViewedAudio(audios)
    JsonComponent(
      "html" -> html
    )

  }

}
