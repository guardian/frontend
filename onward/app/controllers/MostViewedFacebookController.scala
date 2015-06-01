package controllers

import com.gu.facia.api.models.CollectionConfig
import common.`package`._
import common.{Edition, JsonNotFound}
import conf.LiveContentApi
import feed.MostPopularFacebookAutoRefresh
import layout.{CollectionEssentials, FaciaContainer}
import model.{Content, FrontProperties}
import play.api.mvc.{Action, Controller}
import services.{FaciaContentConvert, CollectionConfigWithId}
import slices.Fixed
import scala.concurrent.Future.{successful => unit}

object MostViewedFacebookController extends Controller {
  def renderMostViewed = Action.async { implicit request =>
    MostPopularFacebookAutoRefresh.get match {
      case Some(articleIds) if articleIds.nonEmpty =>
        LiveContentApi.getResponse(
          LiveContentApi
            .search(Edition(request))
            .ids(articleIds.take(7).map(item => feed.urlToContentPath(item.url)).mkString(","))
        ) map { response =>
          val items = response.results
          val container = visuallyPleasingContainerForStories(items.length)

          val dataId = "trending-on-facebook"
          val componentId = Some("trending-on-facebook")
          val displayName = Some("Trending on Facebook")
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
                items.map(Content(_)).map(FaciaContentConvert.frontentContentToFaciaContent),
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
