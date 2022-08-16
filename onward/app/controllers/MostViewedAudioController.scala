package controllers

import common._
import feed.MostViewedAudioAgent
import layout.{CollectionEssentials, FaciaContainer}
import model.pressed.CollectionConfig
import model.{ApplicationContext, Cached, FrontProperties, RelatedContentItem}
import play.api.mvc._
import services.CollectionConfigWithId
import layout.slices.{Fixed, FixedContainers}

class MostViewedAudioController(
    mostViewedAudioAgent: MostViewedAudioAgent,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  def renderMostViewed(): Action[AnyContent] =
    Action { implicit request =>
      getMostViewedAudio() match {
        case Nil   => Cached(60) { JsonNotFound() }
        case audio => renderMostViewedAudio(audio, "audio")
      }
    }

  def renderMostViewedPodcast(): Action[AnyContent] =
    Action { implicit request =>
      getMostViewedPodcast() match {
        case Nil     => Cached(60) { JsonNotFound() }
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

  private def renderMostViewedAudio(audios: Seq[RelatedContentItem], mediaType: String)(implicit
      request: RequestHeader,
  ): Result =
    Cached(900) {
      val dataId = s"$mediaType/most-viewed"
      val displayName = Some(s"most viewed in $mediaType")
      val config = CollectionConfig.empty.copy(displayName = displayName)

      val html = views.html.fragments.containers.facia_cards.container(
        FaciaContainer
          .fromConfigWithId(
            1,
            Fixed(FixedContainers.fixedSmallSlowIV),
            CollectionConfigWithId(dataId, config),
            CollectionEssentials(audios.take(4).map(_.faciaContent), Nil, displayName, None, None, None),
            hasMore = false,
          )
          .withTimeStamps,
        FrontProperties.empty,
      )

      JsonComponent(html)
    }
}
