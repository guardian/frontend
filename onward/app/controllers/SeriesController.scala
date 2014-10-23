package controllers

import com.gu.facia.client.models.CollectionConfig
import play.api.mvc.{ Controller, Action, RequestHeader }
import common._
import model._
import scala.concurrent.Future
import implicits.Requests
import conf.LiveContentApi
import com.gu.contentapi.client.GuardianContentApiError
import com.gu.contentapi.client.model.{Content => ApiContent}
import views.support.{TemplateDeduping}
import layout.ContainerLayout
import slices.{FixedContainers}

case class Series(id: String, tag: Tag, trails: Seq[Content])

object SeriesController extends Controller with Logging with Paging with ExecutionContexts with Requests {

  implicit def getTemplateDedupingInstance: TemplateDeduping = TemplateDeduping()

  def renderSeriesStories(seriesId: String) = Action.async { implicit request =>
    lookup(Edition(request), seriesId) map { series =>
      series.map(renderSeriesTrails).getOrElse(NotFound)
    }
  }

  private def lookup( edition: Edition, seriesId: String)(implicit request: RequestHeader): Future[Option[Series]] = {
    val currentShortUrl = request.getQueryString("shortUrl").getOrElse("")
    log.info(s"Fetching content in series: ${seriesId} the ShortUrl ${currentShortUrl}" )

    def isCurrentStory(content: ApiContent) = content.safeFields.get("shortUrl").map{shortUrl => shortUrl.equals(currentShortUrl)}.getOrElse(false)

    val seriesResponse: Future[Option[Series]] = LiveContentApi.item(seriesId, edition)
      .showFields("all")
      .response
      .map { response =>
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
    val displayName = Some(series.tag.webTitle)
    val properties = FrontProperties(series.tag.description, None, None, None, false, None)
    val collection = Collection(series.trails.take(7), displayName)
    val layout = ContainerLayout(FixedContainers.all("fixed/medium/slow-VII"), collection, None)

    implicit val config = CollectionConfig.withDefaults(
      apiQuery = Some(series.id), displayName = displayName, href = Some(series.id)
    )

    val response = () => views.html.fragments.containers.facia_cards.container(collection, layout, 1, properties, dataId)(request, new views.support.TemplateDeduping, config)

    renderFormat(response, response, 1)
  }
}
