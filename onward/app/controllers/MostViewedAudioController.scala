package controllers

import com.gu.facia.client.models.CollectionConfig
import common._
import layout.{CollectionEssentials, ContainerAndCollection}
import model.{FrontProperties, Audio, Cached}
import play.api.mvc.{RequestHeader, Controller, Action}
import feed.MostViewedAudioAgent
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

  private def getMostViewedAudio()(implicit request: RequestHeader): Seq[Audio] = {
    val size = request.getQueryString("size").getOrElse("4").toInt
    MostViewedAudioAgent.mostViewedAudio().take(size)
  }

  private def getMostViewedPodcast()(implicit request: RequestHeader): Seq[Audio] = {
    val size = request.getQueryString("size").getOrElse("4").toInt
    MostViewedAudioAgent.mostViewedPodcast().take(size)
  }

  private def renderMostViewedAudio(audios: Seq[Audio], mediaType: String)(implicit request: RequestHeader) = Cached(900) {
    val dataId = s"$mediaType/most-viewed"
    val displayName = Some(s"popular in $mediaType")
    val config = CollectionConfig.withDefaults(displayName = displayName)

    val html = views.html.fragments.containers.facia_cards.container(
      ContainerAndCollection(
        1,
        Fixed(FixedContainers.fixedSmallSlowIV),
        CollectionConfigWithId(dataId, config),
        CollectionEssentials(audios take 4, displayName, None, None, None)
      ),
      FrontProperties.empty
    )(request)

    JsonComponent(
      "html" -> html
    )
  }
}
