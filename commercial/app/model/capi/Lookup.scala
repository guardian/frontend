package commercial.model.capi

import com.gu.contentapi.client.model.v1.Tag
import common.Edition.defaultEdition
import common.Logging
import contentapi.ContentApiClient
import model.{Content, ContentType, ImageElement}

import scala.concurrent.{ExecutionContext, Future}

class Lookup(contentApiClient: ContentApiClient) extends Logging with implicits.Strings {

  def content(contentId: String)(implicit executionContext: ExecutionContext): Future[Option[ContentType]] = {
    val response =
      try {
        contentApiClient.getResponse(contentApiClient.item(contentId, defaultEdition))
      } catch {
        case e: Exception => Future.failed(e)
      }
    response map {
      _.content map (Content(_))
    } recover {
      case e: Exception =>
        log.info(s"CAPI search for item '$contentId' failed: ${e.getMessage}")
        None
    }
  }

  def shortUrlToShortId(shortUrl: String): String = {
    /*
        Date: 02nd Dec 2020
        id: 288767d7-ba82-4d67-8fb3-9139e67b0f2e

        CAPI (recently) announced that we would be moving

        from
          https://gu.com/p/abc

        to
          https://theguardian.com/p/abc

        for "short" urls.

        Introducing this to handle gracefully both the old and new convention without having to
        worry when the change will actually happen. This function can be simplified in the future when the migration
        has completed.
     */
    shortUrl
      .replaceFirst("^[a-zA-Z]+://gu.com/", "")
      .replaceFirst("^[a-zA-Z]+://theguardian.com/", "")
  }

  def contentByShortUrls(
      shortUrls: Seq[String],
  )(implicit executionContext: ExecutionContext): Future[Seq[ContentType]] = {
    if (shortUrls.nonEmpty) {
      val shortIds = shortUrls.map(shortUrlToShortId).mkString(",")
      contentApiClient.getResponse(contentApiClient.search(defaultEdition).ids(shortIds)) map {
        _.results map (Content(_))
      }
    } else Future.successful(Nil)
  }

  def latestContentByKeyword(keywordId: String, maxItemCount: Int)(implicit
      executionContext: ExecutionContext,
  ): Future[Seq[ContentType]] = {
    contentApiClient.getResponse(
      contentApiClient
        .item(keywordId.stringDecoded, defaultEdition)
        .pageSize(maxItemCount)
        .showTags("type,series,paid-content")
        .orderBy("newest"),
    ) map {
      _.results.getOrElse(Nil) map (Content(_))
    } recover {
      case e: Exception => {
        log.info(s"CAPI search for item '${keywordId.stringDecoded}' failed: ${e.getMessage}")
        Nil
      }
    }
  }

  def mainPicture(contentId: String)(implicit executionContext: ExecutionContext): Future[Option[ImageElement]] = {
    content(contentId) map (_ flatMap (_.elements.mainPicture))
  }

  def keyword(term: String, section: Option[String] = None)(implicit
      executionContext: ExecutionContext,
  ): Future[Seq[Tag]] = {
    val baseQuery = contentApiClient.tags.q(term).tagType("keyword").pageSize(50)
    val query = section.foldLeft(baseQuery)((acc, sectionName) => acc section sectionName)

    val result = contentApiClient.getResponse(query).map(_.results) recover {
      case e =>
        log.warn(s"Failed to look up [$term]: ${e.getMessage}")
        Nil
    }

    result
  }
}
