package model.commercial

import common.{AkkaAgent, Logging}
import model.Content

import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal

object CapiAgent extends Logging {

  private lazy val shortUrlAgent = AkkaAgent[Map[String, Option[Content]]](Map.empty)

  private lazy val cache = shortUrlAgent.get()

  def contentByShortUrls(shortUrls: Seq[String])
                        (implicit ec: ExecutionContext): Future[Seq[Content]] = {

    val shortUrlIds = shortUrls map { url =>
      val slashPrefixed = if (url startsWith "/") url else s"/$url"
      slashPrefixed.trim
    }

    val urlsNotInCache = shortUrlIds filterNot cache.contains

    def addToCache(contents: Seq[Content]): Future[Map[String, Option[Content]]] = {
      val initialValues = urlsNotInCache.map(_ -> None).toMap
      shortUrlAgent alter (_ ++ initialValues)
      val newContents = contents.map(content => content.shortUrlId -> Some(content)).toMap
      shortUrlAgent alter (_ ++ newContents)
    }

    val eventualNewCache = if (urlsNotInCache.isEmpty) {
      Future.successful(cache)
    } else {
      Lookup.contentByShortUrls(shortUrlIds) flatMap {
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
