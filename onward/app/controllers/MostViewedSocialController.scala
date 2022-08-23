package controllers

import common.`package`._
import common.{Edition, ImplicitControllerExecutionContext, JsonNotFound}
import contentapi.ContentApiClient
import feed.MostPopularSocialAutoRefresh
import layout.{CollectionEssentials, FaciaContainer}
import model.{ApplicationContext, Cached, FrontProperties}
import model.pressed.CollectionConfig
import play.api.mvc._
import services.{CollectionConfigWithId, FaciaContentConvert}
import layout.slices.Fixed

import scala.concurrent.Future.{successful => unit}

class MostViewedSocialController(
    contentApiClient: ContentApiClient,
    mostPopularSocialAutoRefresh: MostPopularSocialAutoRefresh,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext {
  def renderMostViewed(socialContext: String): Action[AnyContent] =
    Action.async { implicit request =>
      val mostPopularSocial = mostPopularSocialAutoRefresh.get

      val articles = socialContext match {
        case "twitter"  => mostPopularSocial.map(_.twitter)
        case "facebook" => mostPopularSocial.map(_.facebook)
        case _          => None
      }

      articles match {
        case Some(articleIds) if articleIds.nonEmpty =>
          contentApiClient.getResponse(
            contentApiClient
              .search(Edition(request))
              .ids(articleIds.take(7).map(item => feed.urlToContentPath(item.url)).mkString(",")),
          ) map { response =>
            val items = response.results
            val container = visuallyPleasingContainerForStories(items.length)

            val dataId = s"trending-on-$socialContext"
            val componentId = Some(s"trending-on-$socialContext")
            val displayName = Some(s"trending on $socialContext")
            val properties = FrontProperties.empty

            val config = CollectionConfig.empty.copy(
              backfill = None,
              displayName = displayName,
              href = None,
            )

            val facebookResponse = () =>
              views.html.fragments.containers.facia_cards.container(
                FaciaContainer
                  .fromConfigWithId(
                    1,
                    Fixed(container),
                    CollectionConfigWithId(dataId, config),
                    CollectionEssentials(
                      items.map(FaciaContentConvert.contentToFaciaContent).toSeq,
                      Nil,
                      displayName,
                      None,
                      None,
                      None,
                    ),
                    false,
                    componentId,
                  )
                  .withTimeStamps,
                properties,
              )

            renderFormat(facebookResponse, facebookResponse, 900)
          }

        case _ =>
          unit(Cached(60)(JsonNotFound()))
      }
    }
}
