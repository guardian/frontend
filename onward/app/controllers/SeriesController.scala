package controllers

import com.gu.contentapi.client.GuardianContentApiThriftError
import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import com.gu.facia.client.models.Backfill
import common._
import contentapi.ContentApiClient
import contentapi.ContentApiClient.getResponse
import implicits.Requests
import layout.{CollectionEssentials, DescriptionMetaHeader, FaciaContainer}
import model._
import model.pressed.CollectionConfig
import play.api.libs.json.{JsArray, Json}
import play.api.mvc.{Action, Controller, RequestHeader}
import services.CollectionConfigWithId
import slices.Fixed
import views.support.FaciaToMicroFormat2Helpers._

import scala.concurrent.Future
import scala.concurrent.duration._

case class Series(id: String, tag: Tag, trails: RelatedContent) {
  lazy val displayName = tag.id match {
    case "commentisfree/commentisfree" => "opinion"
    case _ => tag.metadata.webTitle
 }
}

object SeriesController extends Controller with Logging with Paging with ExecutionContexts with Requests {
  def renderSeriesStories(seriesId: String) = Action.async { implicit request =>
    lookup(Edition(request), seriesId) map { series =>
      series.map(renderSeriesTrails).getOrElse(NotFound)
    }
  }

  def renderMf2SeriesStories(seriesId:String) = Action.async { implicit request =>
    lookup(Edition(request), seriesId) map { series =>
      Cached(15.minutes)(
        series.map(rendermf2Series).getOrElse(NotFound)
      )
    }
  }

  private def lookup( edition: Edition, seriesId: String)(implicit request: RequestHeader): Future[Option[Series]] = {
    val currentShortUrl = request.getQueryString("shortUrl").getOrElse("")
    log.info(s"Fetching content in series: $seriesId the ShortUrl $currentShortUrl" )

    def isCurrentStory(content: ApiContent) =
      content.fields.flatMap(_.shortUrl).exists(_.equals(currentShortUrl))

    val seriesResponse: Future[Option[Series]] = getResponse(ContentApiClient.item(seriesId, edition)
      .showFields("all")
    ).map { response =>
        response.tag.flatMap { tag =>
          val trails = response.results.getOrElse(Nil) filterNot (isCurrentStory(_)) map (RelatedContentItem(_))
          if (!trails.isEmpty) {
            Some(Series(seriesId, Tag.make(tag,None), RelatedContent(trails)))
          } else { None }
        }
      }
      seriesResponse.recover{ case GuardianContentApiThriftError(404, message, _) =>
        log.info(s"Got a 404 calling content api: $message" )
        None
      }
  }

  private def rendermf2Series(series: Series)(implicit request: RequestHeader) = {
    val displayName = Some(series.displayName)
    val seriesStories = series.trails.items take 4
    val description = series.tag.metadata.description.getOrElse("").replaceAll("<.*?>", "")
    
    JsonComponent(
      "items" -> JsArray(Seq(
        Json.obj(
          "displayName" -> displayName,
          "description" -> description,
          "showContent" -> seriesStories.nonEmpty,
          "content" -> seriesStories.map( collection => isCuratedContent(collection.faciaContent))
        )
      ))
    )
  }

  private def renderSeriesTrails(series: Series)(implicit request: RequestHeader) = {
    val dataId = "series"
    val componentId = Some("series")
    val displayName = Some(series.displayName)
    val properties = FrontProperties(series.tag.metadata.description, None, None, None, false, None)
    val header = series.tag.metadata.description map { description => DescriptionMetaHeader(description) }


    val config = CollectionConfig.empty.copy(
      backfill = Some(Backfill(`type` = "capi", query = series.id)),
      displayName = displayName,
      href = Some(series.id)
    )

    val response = () => views.html.fragments.containers.facia_cards.container(
      FaciaContainer(
        1,
        Fixed(visuallyPleasingContainerForStories(series.trails.faciaItems.length)),
        CollectionConfigWithId(dataId, config),
        CollectionEssentials(series.trails.faciaItems take 4, Nil, displayName, None, None, None),
        componentId
      ).withTimeStamps
       .copy(customHeader = header),
      properties
    )(request)

    renderFormat(response, response, 1)
  }
}
