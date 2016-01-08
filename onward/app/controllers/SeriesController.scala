package controllers

import com.gu.contentapi.client.GuardianContentApiError
import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import common._
import conf.LiveContentApi
import conf.LiveContentApi.getResponse
import implicits.Requests
import layout.{CollectionEssentials, DescriptionMetaHeader, FaciaContainer}
import model._
import model.pressed.CollectionConfig
import play.api.mvc.{Action, Controller, RequestHeader}
import services.{CollectionConfigWithId, FaciaContentConvert}
import slices.Fixed

import scala.concurrent.Future

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

  private def lookup( edition: Edition, seriesId: String)(implicit request: RequestHeader): Future[Option[Series]] = {
    val currentShortUrl = request.getQueryString("shortUrl").getOrElse("")
    log.info(s"Fetching content in series: $seriesId the ShortUrl $currentShortUrl" )

    def isCurrentStory(content: ApiContent) =
      content.fields.flatMap(_.shortUrl).exists(_.equals(currentShortUrl))

    val seriesResponse: Future[Option[Series]] = getResponse(LiveContentApi.item(seriesId, edition)
      .showFields("all")
    ).map { response =>
        response.tag.flatMap { tag =>
          val trails = response.results filterNot (isCurrentStory(_)) map (RelatedContentItem(_))
          if (!trails.isEmpty) {
            Some(Series(seriesId, Tag.make(tag,None), RelatedContent(trails)))
          } else { None }
        }
      }
      seriesResponse.recover{ case GuardianContentApiError(404, message, _) =>
        log.info(s"Got a 404 calling content api: $message" )
        None
      }
  }

  private def renderSeriesTrails(series: Series)(implicit request: RequestHeader) = {
    val dataId = "series"
    val componentId = Some("series")
    val displayName = Some(series.displayName)
    val properties = FrontProperties(series.tag.metadata.description, None, None, None, false, None)
    val header = series.tag.metadata.description map { description => DescriptionMetaHeader(description) }


    val config = CollectionConfig.empty.copy(
      apiQuery = Some(series.id), displayName = displayName, href = Some(series.id)
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
