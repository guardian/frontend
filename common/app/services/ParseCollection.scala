package services

import common.FaciaMetrics.S3AuthorizationError
import common._
import conf.{LiveContentApi, Configuration}
import model.Config
import conf.Configuration
import model._
import play.api.libs.json.Json._
import play.api.libs.json._
import scala.concurrent.Future
import contentapi.QueryDefaults
import scala.util.Try
import org.joda.time.DateTime
import performance._
import org.apache.commons.codec.digest.DigestUtils._
import ParseCollectionJsonImplicits._
import com.gu.openplatform.contentapi.model.{Content => ApiContent}
import play.api.libs.ws.Response
import play.api.libs.json.JsObject
import scala.concurrent.duration._
import conf.Switches.{FaciaToolCachedContentApiSwitch, FaciaToolCachedZippingContentApiSwitch}


object Path {
  def unapply[T](uri: String) = Some(uri.split('?')(0))
  def apply[T](uri: String) = uri.split('?')(0)
}

object Seg {
  def unapply(path: String): Option[List[String]] = path.split("/").toList match {
    case "" :: rest => Some(rest)
    case all => Some(all)
  }
}

//Curated and editorsPicks are the same, we will get rid of either
case class Result(
                   curated: List[ApiContent],
                   editorsPicks: List[ApiContent],
                   mostViewed: List[ApiContent],
                   contentApiResults: List[ApiContent]
                   )

object Result {
  val empty: Result = Result(Nil, Nil, Nil, Nil)
}

trait ParseCollection extends ExecutionContexts with QueryDefaults with Logging {
  implicit val apiContentCodec =
    if (FaciaToolCachedZippingContentApiSwitch.isSwitchedOn)
      JsonCodecs.gzippedCodec[Option[ApiContent]]
    else
      JsonCodecs.gzippedCodec[Option[ApiContent]]

  implicit val resultCodec =
    if (FaciaToolCachedZippingContentApiSwitch.isSwitchedOn)
      JsonCodecs.gzippedCodec[Result]
    else
      JsonCodecs.gzippedCodec[Result]

  val cacheDuration: FiniteDuration = 5.minutes

  case class InvalidContent(id: String) extends Exception(s"Invalid Content: $id")
  val showFieldsQuery: String = FaciaDefaults.showFields
  val showFieldsWithBodyQuery: String = FaciaDefaults.showFieldsWithBody

  case class CollectionMeta(lastUpdated: Option[String], updatedBy: Option[String], updatedEmail: Option[String])
  object CollectionMeta {
    def empty: CollectionMeta = CollectionMeta(None, None, None)
  }

  case class CollectionItem(id: String, metaData: Option[Map[String, JsValue]], webPublicationDate: Option[DateTime]) {
    val isSnap: Boolean = id.startsWith("snap/")
  }

  def requestCollection(id: String): Future[Response] = {
    val s3BucketLocation: String = s"${S3FrontsApi.location}/collection/$id/collection.json"
    log.info(s"loading running order configuration from: ${Configuration.frontend.store}/$s3BucketLocation")
    val request = SecureS3Request.urlGet(s3BucketLocation)
    request.withRequestTimeout(2000).get()
  }

  def getCollection(id: String, config: Config, edition: Edition): Future[Collection] = {
    // get the running order from the apiwith
    val response = requestCollection(id)
    for {
      collectionList <- parseResponse(response, edition, id)
      collectionMeta <- getCollectionMeta(response).fallbackTo(Future.successful(CollectionMeta.empty))
      displayName    <- parseDisplayName(response).fallbackTo(Future.successful(None))
      href           <- parseHref(response).fallbackTo(Future.successful(None))
      contentApiList <- config.contentApiQuery.filter(_.nonEmpty)
        .map(executeContentApiQueryViaCache(_, edition))
        .getOrElse(Future.successful(Result(Nil, Nil, Nil, Nil)))
    } yield Collection(
      collectionList,
      contentApiList.editorsPicks.map(makeContent),
      contentApiList.mostViewed.map(makeContent),
      contentApiList.contentApiResults.map(makeContent),
      displayName,
      href,
      collectionMeta.lastUpdated,
      collectionMeta.updatedBy,
      collectionMeta.updatedEmail
    )
  }

  private def getCollectionMeta(response: Future[Response]): Future[CollectionMeta] = {
    response.map { r =>
      val bodyJson = parse(r.body)
      CollectionMeta(
          (bodyJson \ "lastUpdated").asOpt[String],
          (bodyJson \ "updatedBy").asOpt[String],
          (bodyJson \ "updatedEmail").asOpt[String]
      )
    }
  }

  private def parseDisplayName(response: Future[Response]): Future[Option[String]] = response.map {r =>
    (parse(r.body) \ "displayName").asOpt[String].filter(_.nonEmpty)
  }

  private def parseHref(response: Future[Response]): Future[Option[String]] = response.map {r =>
    (parse(r.body) \ "href").asOpt[String].filter(_.nonEmpty)
  }

  private def parseResponse(response: Future[Response], edition: Edition, id: String): Future[List[Content]] = {
    response.flatMap { r =>
      r.status match {
        case 200 =>
          try {
            val bodyJson = parse(r.body)

            // extract the articles
            val articles: Seq[CollectionItem] = (bodyJson \ "live").as[Seq[JsObject]] map { trail =>
              CollectionItem(
                (trail \ "id").as[String],
                (trail \ "meta").asOpt[Map[String, JsValue]],
                (trail \ "frontPublicationDate").asOpt[DateTime])
            }

            getArticles(articles, edition)
          } catch {
            case e: Throwable => {
              log.warn("Could not parse collection JSON for %s".format(id))
              FaciaMetrics.JsonParsingErrorCount.increment()
              throw e
            }
          }
        case 403 => {
          S3AuthorizationError.increment()
          val errorString: String = s"Request failed to authenticate with S3: $id"
          log.warn(errorString)
          Future.failed(throw new Exception(errorString))
        }
        case (httpResponseCode: Int) if httpResponseCode >= 500 =>
          Future.failed(throw new Exception("S3 returned a 5xx"))
        case _ =>
          log.warn(s"Could not load running order: ${r.status} ${r.statusText} $id")
          // NOTE: better way of handling fallback
          Future.successful(Nil)
      }
    }
  }

  def getArticles(collectionItems: Seq[CollectionItem], edition: Edition): Future[List[Content]]
    = getArticles(collectionItems, edition, hasParent=false)

  //hasParent is here to break out of the recursive loop and make sure we only go one deep
  def getArticles(collectionItems: Seq[CollectionItem], edition: Edition, hasParent: Boolean): Future[List[Content]] = {
    if (collectionItems.isEmpty) {
      Future.successful(Nil)
    }
    else {
      val results = collectionItems.foldLeft(Future[List[Content]](Nil)) {
        (foldListFuture, collectionItem) =>
          lazy val supportingAsContent: Future[List[Content]] = {
            lazy val supportingLinks: List[CollectionItem] = retrieveSupportingLinks(collectionItem)
            if (!hasParent) getArticles(supportingLinks, edition, hasParent = true) else Future.successful(Nil)
          }
          if (collectionItem.isSnap) {
            for {
              contentList <- foldListFuture
              supporting  <- supportingAsContent
            } yield contentList :+ new Snap(collectionItem.id, supporting, collectionItem.webPublicationDate.getOrElse(DateTime.now), collectionItem.metaData.getOrElse(Map.empty))
          }
          else {
            val content: Future[Option[ApiContent]] = getContentApiItemFromCollectionItem(collectionItem, edition)
            supportingAsContent.onFailure {
              case t: Throwable => log.warn("Supporting links: %s: %s".format(collectionItem.id, t.toString))
            }

            for {
              contentList <- foldListFuture
              itemResponse <- content
              supporting <- supportingAsContent
            } yield {
              itemResponse
                .map(Content(_, supporting, collectionItem.metaData))
                .map(validateContent)
                .map(_ +: contentList)
                .getOrElse(contentList)
            }
          }
      }
      val sorted = results map { _.sortBy(t => collectionItems.indexWhere(_.id == t.id))}
      sorted
    }
  }

  private def getContentApiItemFromCollectionItem(collectionItem: CollectionItem, edition: Edition): Future[Option[ApiContent]] = {
    lazy val response = LiveContentApi.item(collectionItem.id, edition).showFields(showFieldsWithBodyQuery)
      .response
      .map(Option.apply)
      .recover {
      case apiError: com.gu.openplatform.contentapi.ApiError if apiError.httpStatus == 404 => {
        log.warn(s"Content API Error: 404 for ${collectionItem.id}")
        None
      }
      case apiError: com.gu.openplatform.contentapi.ApiError if apiError.httpStatus == 410 => {
        log.warn(s"Content API Error: 410 for ${collectionItem.id}")
        None
      }
      case jsonParseError: net.liftweb.json.JsonParser.ParseException => {
        ContentApiMetrics.ContentApiJsonParseExceptionMetric.increment()
        throw jsonParseError
      }
      case mappingException: net.liftweb.json.MappingException => {
        ContentApiMetrics.ContentApiJsonMappingExceptionMetric.increment()
        throw mappingException
      }
      case t: Throwable => {
        log.warn("%s: %s".format(collectionItem.id, t.toString))
        throw t
      }
    }

    if (FaciaToolCachedContentApiSwitch.isSwitchedOn) {
      MemcachedFallback.withMemcachedFallBack(collectionItem.id, cacheDuration)(response.map(_.flatMap(_.content)))
    }
    else {
      response.map(_.flatMap(_.content))
    }
  }

  private def retrieveSupportingLinks(collectionItem: CollectionItem): List[CollectionItem] =
    collectionItem.metaData.map(_.get("supporting").flatMap(_.asOpt[List[JsValue]]).getOrElse(Nil)
      .map(json => CollectionItem((json \ "id").as[String], (json \ "meta").asOpt[Map[String, JsValue]], (json \ "frontPublicationDate").asOpt[DateTime]))
    ).getOrElse(Nil)



  def executeContentApiQueryViaCache(queryString: String, edition: Edition): Future[Result] = {
    if (FaciaToolCachedContentApiSwitch.isSwitchedOn) {
      MemcachedFallback.withMemcachedFallBack(
        sha256Hex(queryString),
        cacheDuration
      ) {
        executeContentApiQuery(queryString, edition)
      }
    } else {
      executeContentApiQuery(queryString, edition)
    }

  }

  def executeContentApiQuery(queryString: String, edition: Edition): Future[Result] = {
      val queryParams: Map[String, String] = QueryParams.get(queryString).mapValues {
        _.mkString("")
      }
      val queryParamsWithEdition = queryParams + ("edition" -> queryParams.getOrElse("edition", Edition.defaultEdition.id))

      val backFillResponse: Future[Result] = (queryString match {
        case Path(Seg("search" :: Nil)) =>
          val search = LiveContentApi.search(edition)
            .showElements("all")
            .pageSize(20)
          val newSearch = queryParamsWithEdition.foldLeft(search) {
            case (query, (key, value)) => query.stringParam(key, value)
          }.showFields(showFieldsQuery)
          newSearch.response map { searchResponse =>
            Result(
              curated = Nil,
              editorsPicks = Nil,
              mostViewed = Nil,
              contentApiResults = searchResponse.results
            )
          }
        case Path(id) =>
          val search = LiveContentApi.item(id, edition)
            .showElements("all")
            .showEditorsPicks(true)
            .pageSize(20)
          val newSearch = queryParamsWithEdition.foldLeft(search) {
            case (query, (key, value)) => query.stringParam(key, value)
          }.showFields(showFieldsQuery)
          newSearch.response map { itemResponse =>
            Result(
              curated = Nil,
              editorsPicks = itemResponse.editorsPicks,
              mostViewed = itemResponse.mostViewed,
              contentApiResults = itemResponse.results
            )
          }
      }).recover(executeContentApiQueryRecovery)

    backFillResponse onFailure {
      case t: Throwable => log.warn("Content API Query failed: %s: %s".format(queryString, t.toString))
    }

    backFillResponse
  }

  def makeContent(content: ApiContent): Content = validateContent(Content(content))

  def validateContent(content: Content): Content = {
    Try {
      //These will throw if they don't exist because of unsafe Map.apply
      content.headline.isEmpty
      content.shortUrl.isEmpty
      content
    }.getOrElse {
      FaciaToolMetrics.InvalidContentExceptionMetric.increment()
      throw new InvalidContent(content.id)
    }
  }

  val executeContentApiQueryRecovery: PartialFunction[Throwable, Result] = {
    case apiError: com.gu.openplatform.contentapi.ApiError if apiError.httpStatus == 404 => {
      log.warn(s"Content API Error: 404 for ${apiError.httpMessage}")
      Result.empty
    }
    case apiError: com.gu.openplatform.contentapi.ApiError if apiError.httpStatus == 410 => {
      log.warn(s"Content API Error: 410 for ${apiError.httpMessage}")
      Result.empty
    }
    case e: Exception => {
      log.warn(s"ExecuteContentApiQueryRecovery: $e")
      throw e
    }
  }

}
