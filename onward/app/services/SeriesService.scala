package services

import com.gu.contentapi.client.model.{ContentApiError, ItemQuery}
import common.{Edition, GuLogging}
import play.api.mvc.RequestHeader
import utils.ShortUrls
import com.gu.contentapi.client.model.v1.{Tag, Content => ApiContent}
import contentapi.ContentApiClient
import model.RelatedContentItem

import scala.concurrent.{ExecutionContext, Future}

class SeriesService(contentApiClient: ContentApiClient)(implicit executionContext: ExecutionContext,
) extends GuLogging {
  def fetch[T](edition: Edition,
               seriesId: String,
               queryModifier: ItemQuery => ItemQuery = identity,
               f: (Tag, Seq[RelatedContentItem]) => T
              )(implicit request: RequestHeader): Future[Option[T]] = {
    val currentShortUrl = request.getQueryString("shortUrl")

    def isCurrentStory(content: ApiContent) =
      content.fields
        .flatMap(fields => fields.shortUrl.map(ShortUrls.shortUrlToShortId))
        .exists(url => currentShortUrl.exists(_.endsWith(url)))

    val query = queryModifier {
      contentApiClient.item(seriesId, edition).showFields("all")
    }

    val response: Future[Option[T]] = contentApiClient.getResponse(query).map { response =>
      response.tag.flatMap { tag =>
        val trails = response.results.getOrElse(Nil) filterNot isCurrentStory map (RelatedContentItem(_))
        Option.when(trails.nonEmpty)(f(tag, trails.toSeq))
      }
    }

    response.recover {
      case ContentApiError(404, message, _) =>
        log.info(s"Got a 404 calling content api: $message")
        None
    }
  }
}
