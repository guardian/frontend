package controllers

import common.`package`._
import common.{ExecutionContexts, Edition, JsonNotFound}
import conf.LiveContentApi
import feed.MostPopularSocialAutoRefresh
import layout.{CollectionEssentials, FaciaContainer}
import model.FrontProperties
import model.pressed.CollectionConfig
import play.api.mvc.{Action, Controller}
import services.{FaciaContentConvert, CollectionConfigWithId}
import slices.Fixed
import scala.concurrent.Future.{successful => unit}

object MostViewedSocialController extends Controller with ExecutionContexts {
  def renderMostViewed(socialContext: String) = Action.async { implicit request =>
    val mostPopularSocial = MostPopularSocialAutoRefresh.get

    val articles = socialContext match {
      case "twitter" => mostPopularSocial.map(_.twitter)
      case "facebook" => mostPopularSocial.map(_.facebook)
      case _ => None
    }

    articles match {
      case Some(articleIds) if articleIds.nonEmpty =>
        LiveContentApi.getResponse(
          LiveContentApi
            .search(Edition(request))
            .ids(articleIds.take(7).map(item => feed.urlToContentPath(item.url)).mkString(","))
        ) map { response =>
          val items = response.results
          val container = visuallyPleasingContainerForStories(items.length)

          val dataId = s"trending-on-$socialContext"
          val componentId = Some(s"trending-on-$socialContext")
          val displayName = Some(s"trending on $socialContext")
          val properties = FrontProperties(None, None, None, None, false, None)

          val config = CollectionConfig.empty.copy(
            apiQuery = None, displayName = displayName, href = None
          )

          val facebookResponse = () => views.html.fragments.containers.facia_cards.container(
            FaciaContainer(
              1,
              Fixed(container),
              CollectionConfigWithId(dataId, config),
              CollectionEssentials(
                items.map(FaciaContentConvert.contentToFaciaContent(_)),
                Nil,
                displayName,
                None,
                None,
                None
              ),
              componentId
            ).withTimeStamps,
            properties
          )(request)

          renderFormat(facebookResponse, facebookResponse, 1)
        }

      case _ =>
        unit(JsonNotFound())
    }
  }
}
