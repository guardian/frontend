package controllers

import java.net.URI
import com.gu.contentapi.client.model.{ContentApiError, ItemQuery}
import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import common.{JsonComponent, _}
import contentapi.ContentApiClient
import implicits.Requests
import layout.FaciaContainer
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model._
import play.api.libs.json.{JsArray, Json}
import play.api.mvc._
import views.support.FaciaToMicroFormat2Helpers._
import models.{Series, SeriesHelper, SeriesStoriesDCR}
import utils.ShortUrls

import scala.concurrent.Future
import scala.concurrent.duration._

class SeriesController(
    contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with GuLogging
    with Paging
    with ImplicitControllerExecutionContext
    with Requests {

  def renderSeriesStories(seriesId: String): Action[AnyContent] =
    Action.async { implicit request =>
      if (request.forceDCR) {
        lookup(Edition(request), seriesId).map { mseries =>
          mseries
            .map { series => JsonComponent.fromWritable(SeriesStoriesDCR.fromSeries(series)).result }
            .getOrElse(NotFound)
        }
      } else {
        lookup(Edition(request), seriesId) map { series =>
          series.map(renderSeriesTrails).getOrElse(NotFound)
        }
      }
    }

  def renderMf2SeriesStories(seriesId: String): Action[AnyContent] =
    Action.async { implicit request =>
      lookup(Edition(request), seriesId) map {
        _.map(series =>
          Cached(15.minutes)(
            rendermf2Series(series),
          ),
        ).getOrElse(Cached(15.minutes)(WithoutRevalidationResult(NotFound)))
      }
    }

  def renderPodcastEpisodes(seriesId: String): Action[AnyContent] =
    Action.async { implicit request =>
      lookup(Edition(request), seriesId, _.contentType("audio")) map {
        _.map(series =>
          Cached(900) {
            JsonComponent(views.html.fragments.podcastEpisodes(series.trails.items.take(4).map(_.content)))
          },
        ).getOrElse(NotFound)
      }
    }

  private def lookup(edition: Edition, seriesId: String, queryModifier: ItemQuery => ItemQuery = identity)(implicit
      request: RequestHeader,
  ): Future[Option[Series]] = {
    val currentShortUrl = request.getQueryString("shortUrl")

    def isCurrentStory(content: ApiContent) =
      content.fields
        .flatMap(fields => fields.shortUrl.map(ShortUrls.shortUrlToShortId))
        .exists(url => currentShortUrl.exists(_.endsWith(url)))

    val query = queryModifier {
      contentApiClient.item(seriesId, edition).showFields("all")
    }

    val seriesResponse: Future[Option[Series]] = contentApiClient.getResponse(query).map { response =>
      response.tag.flatMap { tag =>
        val trails = response.results.getOrElse(Nil) filterNot isCurrentStory map (RelatedContentItem(_))
        if (trails.nonEmpty) {
          Some(Series(seriesId, Tag.make(tag, None), RelatedContent(trails.toSeq)))
        } else { None }
      }
    }
    seriesResponse.recover {
      case ContentApiError(404, message, _) =>
        log.info(s"Got a 404 calling content api: $message")
        None
    }
  }

  private def rendermf2Series(series: Series)(implicit request: RequestHeader): RevalidatableResult = {
    val displayName = Some(series.displayName)
    val seriesStories = series.trails.items take 4
    val description = series.tag.metadata.description.getOrElse("").replaceAll("<.*?>", "")

    JsonComponent(
      "items" -> JsArray(
        Seq(
          Json.obj(
            "displayName" -> displayName,
            "description" -> description,
            "showContent" -> seriesStories.nonEmpty,
            "content" -> seriesStories.map(collection => isCuratedContent(collection.faciaContent)),
          ),
        ),
      ),
    )
  }

  private def renderSeriesTrails(series: Series)(implicit request: RequestHeader): Result = {
    val (containerDefinition: FaciaContainer, frontProperties: FrontProperties) =
      SeriesHelper.dataForContainerRendering(series)
    val frontId = request.referrer.map(new URI(_).getPath.stripPrefix("/"))
    val response = () =>
      views.html.fragments.containers.facia_cards.container(
        containerDefinition = containerDefinition,
        frontProperties = frontProperties,
        frontId = frontId,
      )
    renderFormat(response, response, 900)
  }
}
