package services

import com.amazonaws.services.s3.AmazonS3Client
import com.gu.facia.client.models.{SupportingItemMetaData, TrailMetaData}
import com.gu.facia.client.{AmazonSdkS3Client, ApiClient}
import common._
import conf.LiveContentApi
import conf.Configuration
import model._
import play.api.libs.json.Json._
import play.api.libs.json._
import scala.concurrent.Future
import contentapi.{ContentApiClient, QueryDefaults}
import scala.util.{Failure, Success, Try}
import org.joda.time.DateTime
import performance._
import org.apache.commons.codec.digest.DigestUtils._
import ParseCollectionJsonImplicits._
import com.gu.openplatform.contentapi.model.{Content => ApiContent}
import play.api.libs.ws.WSResponse
import play.api.libs.json.JsObject
import scala.concurrent.duration._
import conf.Switches.FaciaToolCachedContentApiSwitch
import common.S3Metrics.S3AuthorizationError


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
  implicit def apiContentCodec = JsonCodecs.snappyCodec[Option[ApiContent]]

  implicit def resultCodec = JsonCodecs.snappyCodec[Result]

  val cacheDuration: FiniteDuration = 5.minutes

  val amazonClient: ApiClient =
    ApiClient("aws-frontend-store", Configuration.facia.stage, AmazonSdkS3Client(new AmazonS3Client(Configuration.aws.credentials.get)))

  val client: ContentApiClient
  def retrieveItemsFromCollectionJson(collection: com.gu.facia.client.models.Collection): Seq[CollectionItem]

  case class InvalidContent(id: String) extends Exception(s"Invalid Content: $id")
  val showFieldsQuery: String = FaciaDefaults.showFields
  val showFieldsWithBodyQuery: String = FaciaDefaults.showFieldsWithBody

  case class CollectionMeta(
    lastUpdated: Option[String],
    updatedBy: Option[String],
    updatedEmail: Option[String],
    displayName: Option[String],
    href: Option[String])
  object CollectionMeta {
    def empty: CollectionMeta = CollectionMeta(None, None, None, None, None)
  }

  case class CollectionItem(id: String, metaData: Option[TrailMetaData], webPublicationDate: Option[DateTime]) {
    val isSnap: Boolean = Snap.isSnap(id)
  }

  def requestCollection(id: String): Future[WSResponse] = {
    val s3BucketLocation: String = s"${S3FrontsApi.location}/collection/$id/collection.json"
    log.info(s"loading running order configuration from: ${Configuration.frontend.store}/$s3BucketLocation")
    val request = SecureS3Request.urlGet(s3BucketLocation)
    request.withRequestTimeout(2000).get()
  }

  def getCollection(id: String, config: Config, edition: Edition): Future[Collection] = {
    val collection: Future[Option[com.gu.facia.client.models.Collection]] =
      amazonClient.collection(id)
        .map(Option.apply)
        .recover { case _: Throwable => None }

    val curatedItems: Future[Seq[Content]] = collection.flatMap { collectionOption =>
      val items: Seq[CollectionItem] =
        collectionOption.fold[Seq[CollectionItem]](Nil)(retrieveItemsFromCollectionJson)
      getArticles(items, edition)
    }

    val executeDraftContentApiQuery: Future[Result] =
      config.contentApiQuery.map(executeContentApiQueryViaCache(_, edition)).getOrElse(Future.successful(Result.empty))

    for {
      executeRequest <- executeDraftContentApiQuery
      curatedRequest <- curatedItems
      collectionOption <- collection
    } yield Collection(
      curated = curatedRequest,
      editorsPicks = executeRequest.editorsPicks.map(makeContent),
      mostViewed = executeRequest.mostViewed.map(makeContent),
      results = executeRequest.contentApiResults.map(makeContent),
      displayName = collectionOption.flatMap(_.displayName),
      href = collectionOption.flatMap(_.href),
      lastUpdated = collectionOption.map(_.lastUpdated.toString()),
      updatedBy = collectionOption.map(_.updatedBy),
      updatedEmail = collectionOption.map(_.updatedEmail)
    )
  }

  private def getCollectionMeta(collectionJson: JsValue): CollectionMeta =
    CollectionMeta(
        (collectionJson \ "lastUpdated").asOpt[String],
        (collectionJson \ "updatedBy").asOpt[String],
        (collectionJson \ "updatedEmail").asOpt[String],
        (collectionJson \ "displayName").asOpt[String],
        (collectionJson \ "href").asOpt[String]
    )

  private def responseToJson(response: WSResponse): JsValue = {
    response.status match {
      case 200 =>
        Try(parse(response.body)).getOrElse(JsNull)
      case 403 =>
        S3AuthorizationError.increment()
        val errorString: String = s"Request failed to authenticate with S3 ${response.status} ${response.statusText}"
        log.warn(errorString)
        throw new Exception(errorString)
      case httpResponseCode: Int if httpResponseCode >= 500 =>
        throw new Exception("S3 returned a 5xx")
      case _ =>
        log.warn(s"Could not load running order: ${response.status} ${response.statusText}")
        // NOTE: better way of handling fallback
        JsNull
    }
  }

  def getArticles(collectionItems: Seq[CollectionItem], edition: Edition): Future[Seq[Content]] = {
    batchGetContentApiItems(collectionItems ++ collectionItems.flatMap(retrieveSupportingLinks), edition) map { items =>
      collectionItems flatMap { collectionItem =>
        val supporting = retrieveSupportingLinks(collectionItem).flatMap({ collectionItem =>
          items.get(collectionItem) map { item =>
            Content(
              item,
              Nil,
              collectionItem.metaData
            )
          }
        })

        if (collectionItem.isSnap) {
          Some(new Snap(
            collectionItem.id,
            supporting,
            collectionItem.webPublicationDate.getOrElse(DateTime.now),
            collectionItem.metaData
          ))
        } else {
          items.get(collectionItem) map { item =>
            validateContent(Content(
              item,
              supporting,
              collectionItem.metaData
            ))
          }
        }
      }
    }
  }

  private def batchGetContentApiItems(collectionItems: Seq[CollectionItem],
                                      edition: Edition): Future[Map[CollectionItem, ApiContent]] = {
    Futures.batchedTraverse(collectionItems, Configuration.faciatool.frontPressItemBatchSize)({ collectionItem =>
      getContentApiItemFromCollectionItem(collectionItem, edition) map { maybeItem =>
        maybeItem.map(collectionItem -> _)
      }
    }).map(_.flatten.toMap)
  }

  private def getContentApiItemFromCollectionItem(collectionItem: CollectionItem,
                                                  edition: Edition): Future[Option[ApiContent]] = {
    lazy val response = client.item(collectionItem.id, edition).showFields(showFieldsWithBodyQuery)
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
    }.map(_.flatMap(_.content))

    if (FaciaToolCachedContentApiSwitch.isSwitchedOn) {
      MemcachedFallback.withMemcachedFallBack(collectionItem.id, cacheDuration)(response)
    }
    else {
      response
    }
  }

  private def makeSupportingMeta(meta: SupportingItemMetaData): TrailMetaData =
    TrailMetaData(
      headline = meta.headline,
      href = meta.href,
      snapType = meta.snapType,
      snapCss = meta.snapCss,
      snapUri = meta.snapUri,
      trailText = meta.trailText,
      group = meta.group,
      imageAdjust = meta.imageAdjust,
      imageSrc = meta.imageSrc,
      imageSrcWidth = meta.imageSrcWidth,
      imageSrcHeight = meta.imageSrcHeight,
      isBreaking = meta.isBreaking,
      supporting = None,
      showMainVideo = None,
      isBoosted = None,
      imageHide = None
    )

  private def retrieveSupportingLinks(collectionItem: CollectionItem): List[CollectionItem] =
    collectionItem.metaData.flatMap(_.supporting.map(_.map { supportingItem =>
      CollectionItem(supportingItem.id, supportingItem.meta.map(makeSupportingMeta), None) //supportingItem)
    })).getOrElse(Nil)

  def executeContentApiQueryViaCache(queryString: String, edition: Edition): Future[Result] = {
    lazy val contentApiQuery = executeContentApiQuery(queryString, edition)
    if (FaciaToolCachedContentApiSwitch.isSwitchedOn) {
      MemcachedFallback.withMemcachedFallBack(
        sha256Hex(queryString),
        cacheDuration
      ) {
        contentApiQuery
      }
    } else {
      contentApiQuery
    }

  }

  def executeContentApiQuery(queryString: String, edition: Edition): Future[Result] = {
      val queryParams: Map[String, String] = QueryParams.get(queryString).mapValues {
        _.mkString("")
      }
      val queryParamsWithEdition = queryParams + ("edition" -> queryParams.getOrElse("edition", Edition.defaultEdition.id))

      val backFillResponse: Future[Result] = (queryString match {
        case Path(Seg("search" :: Nil)) =>
          val search = client.search(edition)
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
          val search = client.item(id, edition)
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

object LiveCollections extends ParseCollection {
  def retrieveItemsFromCollectionJson(collection: com.gu.facia.client.models.Collection): Seq[CollectionItem] =
    collection.live.map { trail =>
      CollectionItem(
        trail.id,
        trail.meta,
        Option(new DateTime(trail.frontPublicationDate)))
    }

  override val client: ContentApiClient = LiveContentApi
}
