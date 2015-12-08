package controllers

import com.gu.facia.api.models.CollectionConfig
import common._
import feed.MostViewedAudioAgent
import layout.{CollectionEssentials, FaciaContainer}
import model.{RelatedContentItem, Cached, FrontProperties}
import play.api.mvc.{Action, Controller, RequestHeader}
import services.CollectionConfigWithId
import slices.{Fixed, FixedContainers}

object MostViewedAudioController extends Controller with Logging with ExecutionContexts {
  def renderMostViewed() = Action { implicit request =>
    getMostViewedAudio match {
      case Nil => Cached(60) { JsonNotFound() }
      case audio => Cached(900) { renderMostViewedAudio(audio, "audio") }
    }
  }

  def renderMostViewedPodcast() = Action { implicit request =>
    getMostViewedPodcast match {
      case Nil => Cached(60) { JsonNotFound() }
      case podcast => Cached(900) { renderMostViewedAudio(podcast, "podcast") }
    }
  }

  private def getMostViewedAudio()(implicit request: RequestHeader): Seq[RelatedContentItem] = {
    val size = request.getQueryString("size").getOrElse("4").toInt
    MostViewedAudioAgent.mostViewedAudio().take(size)
  }

  private def getMostViewedPodcast()(implicit request: RequestHeader): Seq[RelatedContentItem] = {
    val size = request.getQueryString("size").getOrElse("4").toInt
    MostViewedAudioAgent.mostViewedPodcast().take(size)
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

    JsonComponent(
      "html" -> html
    )
  }
}
