package controllers

import common._
import feed.MostViewedAudioAgent
import layout.{CollectionEssentials, FaciaContainer}
import model.pressed.CollectionConfig
import model.{RelatedContentItem, Cached, FrontProperties}
import play.api.mvc.{Action, Controller, RequestHeader}
import services.CollectionConfigWithId
import slices.{Fixed, FixedContainers}

class MostViewedAudioController(mostViewedAudioAgent: MostViewedAudioAgent) extends Controller with Logging with ExecutionContexts {
  def renderMostViewed() = Action { implicit request =>
    getMostViewedAudio match {
      case Nil => Cached(60) { JsonNotFound() }
      case audio => renderMostViewedAudio(audio, "audio")
    }
  }

  def renderMostViewedPodcast() = Action { implicit request =>
    getMostViewedPodcast match {
      case Nil => Cached(60) { JsonNotFound() }
      case podcast => renderMostViewedAudio(podcast, "podcast")
    }
  }

  private def getMostViewedAudio()(implicit request: RequestHeader): List[RelatedContentItem] = {
    val size = request.getQueryString("size").getOrElse("4").toInt
    mostViewedAudioAgent.mostViewedAudio().take(size).toList
  }

  private def getMostViewedPodcast()(implicit request: RequestHeader): List[RelatedContentItem] = {
    val size = request.getQueryString("size").getOrElse("4").toInt
    mostViewedAudioAgent.mostViewedPodcast().take(size).toList
  }

  private def renderMostViewedAudio(audios: Seq[RelatedContentItem], mediaType: String)(implicit request: RequestHeader) = Cached(900) {
    val dataId = s"$mediaType/most-viewed"
    val displayName = Some(s"popular in $mediaType")
    val config = CollectionConfig.empty.copy(displayName = displayName)

    val html = views.html.fragments.containers.facia_cards.container(
      FaciaContainer(
        1,
        Fixed(FixedContainers.fixedSmallSlowIV),
        CollectionConfigWithId(dataId, config),
        CollectionEssentials(audios.map(_.faciaContent) take 4, Nil, displayName, None, None, None)
      ).withTimeStamps,
      FrontProperties.empty
    )(request)

    JsonComponent(html)
  }
}
