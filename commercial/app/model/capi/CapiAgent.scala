package commercial.model.capi

import common.{Box, GuLogging}
import contentapi.ContentApiClient
import model.ContentType

import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal

class CapiAgent(contentApiClient: ContentApiClient) extends GuLogging {

  private lazy val shortUrlAgent = Box[Map[String, Option[ContentType]]](Map.empty)
  private val lookup = new Lookup(contentApiClient)

  private lazy val cache = shortUrlAgent.get()

  private[commercial] def idsFromShortUrls(shortUrls: Seq[String]): Seq[String] =
    shortUrls map (_.trim.stripPrefix("/").stripSuffix("/stw"))

  def contentByShortUrls(shortUrls: Seq[String])(implicit ec: ExecutionContext): Future[Seq[ContentType]] = {

    val shortUrlIds = idsFromShortUrls(shortUrls)
    val urlsNotInCache = shortUrlIds filterNot cache.contains

    def addToCache(contents: Seq[ContentType]): Future[Map[String, Option[ContentType]]] = {

      /*
       * There's some ambiguity about short IDs in capi.
       * To search by ID, the capi query takes the form: /search?ids=p/4z2fv
       * But the internalShortId field for the result has a leading slash, eg. /p/4z2fv
       * So for consistency strip leading slash so that it's in a lookupable form,
       * ie suitable to be included in a capi ids query.
       */
      def mkCacheKey(shortUrlId: String): String = shortUrlId.stripPrefix("/")

      shortUrlAgent alter { cache =>
        val initialValuesForUrlsNotInCache = urlsNotInCache.map(_ -> None).toMap
        cache ++ initialValuesForUrlsNotInCache
        cache ++ contents.map { content =>
          mkCacheKey(content.content.shortUrlId) -> Some(content)
        }.toMap
      }
    }

    val eventualNewCache = if (urlsNotInCache.isEmpty) {
      Future.successful(cache)
    } else {
      lookup.contentByShortUrls(shortUrlIds) flatMap {
        addToCache
      } recoverWith {
        case NonFatal(e) =>
          log.error(s"Lookup failed: ${e.getMessage}")
          Future.successful(cache)
      }
    }

    eventualNewCache map { newCache =>
      shortUrlIds.flatMap(newCache.get).flatten
    }
  }
}
