package controllers

import com.gu.facia.client.models.{CollectionConfigJson => CollectionConfig}
import play.api.mvc.{Controller, Action, RequestHeader}
import common._
import model._
import services.CollectionConfigWithId
import scala.concurrent.Future
import implicits.Requests
import conf.LiveContentApi
import com.gu.contentapi.client.GuardianContentApiError
import com.gu.contentapi.client.model.{Content => ApiContent}
import layout.{CollectionEssentials, FaciaContainer}
import slices.{Fixed, FixedContainers}
import LiveContentApi.getResponse

case class Series(id: String, tag: Tag, trails: Seq[Content])

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
      content.safeFields.get("shortUrl").exists(_.equals(currentShortUrl))

    val seriesResponse: Future[Option[Series]] = getResponse(LiveContentApi.item(seriesId, edition)
      .showFields("all")
    ).map { response =>
        response.tag.flatMap { tag =>
          val trails = response.results filterNot (isCurrentStory(_)) map (Content(_))
          if (!trails.isEmpty) {
            Some(Series(seriesId, Tag(tag,None), trails))
          } else { None }
        }
      }
      seriesResponse.recover{ case GuardianContentApiError(404, message) =>
        log.info(s"Got a 404 calling content api: $message" )
        None
      }
  }

  private def renderSeriesTrails(series: Series)(implicit request: RequestHeader) = {
    val dataId = "series"
    val componentId = Some("series")
    val displayName = Some(series.tag.webTitle)
    val properties = FrontProperties(series.tag.description, None, None, None, false, None)

    val config = CollectionConfig.withDefaults(
      apiQuery = Some(series.id), displayName = displayName, href = Some(series.id)
    )

    val response = () => views.html.fragments.containers.facia_cards.container(
      FaciaContainer(
        1,
        Fixed(FixedContainers.fixedMediumSlowVII),
        CollectionConfigWithId(dataId, config),
        CollectionEssentials(series.trails take 7, Nil, displayName, None, None, None),
        componentId
      ).withTimeStamps,
      properties
    )(request)

    renderFormat(response, response, 1)
  }
}
