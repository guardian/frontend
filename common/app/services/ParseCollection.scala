package services

import common.FaciaMetrics.S3AuthorizationError
import common._
import conf.{DraftContentApi, LiveContentApi, Configuration}
import model.{Snap, Collection, Config, Content}
import play.api.libs.json.Json._
import play.api.libs.json.{JsNull, JsObject, JsValue}
import play.api.libs.ws.Response
import scala.concurrent.Future
import contentapi.{ContentApiClient, QueryDefaults}
import scala.util.Try
import org.joda.time.DateTime

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

trait ParseCollection extends ExecutionContexts with QueryDefaults with Logging {

  val client: ContentApiClient
  def retrieveItemsFromCollectionJson(collectionJson: JsValue): Seq[CollectionItem]

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

  case class CollectionItem(id: String, metaData: Option[Map[String, JsValue]], webPublicationDate: Option[DateTime]) {
    val isSnap: Boolean = id.startsWith("snap/")
  }

  //Curated and editorsPicks are the same, we will get rid of either
  case class Result(curated: List[Content], editorsPicks: List[Content], mostViewed: List[Content], contentApiResults: List[Content])

  def requestCollection(id: String): Future[Response] = {
    val s3BucketLocation: String = s"${S3FrontsApi.location}/collection/$id/collection.json"
    log.info(s"loading running order configuration from: ${Configuration.frontend.store}/$s3BucketLocation")
    val request = SecureS3Request.urlGet(s3BucketLocation)
    request.withRequestTimeout(2000).get()
  }

  def getCollection(id: String, config: Config, edition: Edition): Future[Collection] = {
    val collectionJson: Future[JsValue] = requestCollection(id)
      .map(responseToJson)

    val curatedItems: Future[List[Content]] = collectionJson
        .map(retrieveItemsFromCollectionJson)
        .flatMap { items => getArticles(items, edition) }
    val executeDraftContentApiQuery: Future[Result] = executeContentApiQuery(config.contentApiQuery, edition)
    val collectionMetaData: Future[CollectionMeta] = collectionJson.map(getCollectionMeta)

    for {
      curatedRequest <- curatedItems
      executeRequest <- executeDraftContentApiQuery
      collectionMeta <- collectionMetaData
    } yield Collection(
      curated = curatedRequest,
      editorsPicks = executeRequest.editorsPicks,
      mostViewed = executeRequest.mostViewed,
      results = executeRequest.contentApiResults,
      displayName = collectionMeta.displayName,
      href = collectionMeta.href,
      lastUpdated = collectionMeta.lastUpdated,
      updatedBy = collectionMeta.updatedBy,
      updatedEmail = collectionMeta.updatedEmail)
  }

  def retrieveDraftItemsFromCollectionJson(json: JsValue): Seq[CollectionItem] =
    (json \ "draft").asOpt[Seq[JsObject]].orElse((json \ "live").asOpt[Seq[JsObject]]).getOrElse(Nil).map { trail =>
      CollectionItem(
        (trail \ "id").as[String],
        (trail \ "meta").asOpt[Map[String, JsValue]],
        (trail \ "frontPublicationDate").asOpt[DateTime])
    }

  private def getCollectionMeta(collectionJson: JsValue): CollectionMeta =
    CollectionMeta(
        (collectionJson \ "lastUpdated").asOpt[String],
        (collectionJson \ "updatedBy").asOpt[String],
        (collectionJson \ "updatedEmail").asOpt[String],
        (collectionJson \ "displayName").asOpt[String],
        (collectionJson \ "href").asOpt[String]
    )

  private def responseToJson(response: Response): JsValue = {
    response.status match {
      case 200 =>
        Try(parse(response.body)).getOrElse(JsNull)
      case 403 =>
        S3AuthorizationError.increment()
        val errorString: String = s"Request failed to authenticate with S3: ${response.getAHCResponse.getUri}"
        log.warn(errorString)
        throw new Exception(errorString)
      case httpResponseCode: Int if httpResponseCode >= 500 =>
        throw new Exception("S3 returned a 5xx")
      case _ =>
        log.warn(s"Could not load running order: ${response.status} ${response.statusText} ${response.getAHCResponse.getUri}")
        // NOTE: better way of handling fallback
        JsNull
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
            val response = client.item(collectionItem.id, edition).showFields(showFieldsWithBodyQuery).response

            val content = response.map(_.content).recover {
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

  private def retrieveSupportingLinks(collectionItem: CollectionItem): List[CollectionItem] =
    collectionItem.metaData.map(_.get("supporting").flatMap(_.asOpt[List[JsValue]]).getOrElse(Nil)
      .map(json => CollectionItem((json \ "id").as[String], (json \ "meta").asOpt[Map[String, JsValue]], (json \ "frontPublicationDate").asOpt[DateTime]))
    ).getOrElse(Nil)

  def executeContentApiQuery(s: Option[String], edition: Edition): Future[Result] = s filter(_.nonEmpty) map { queryString =>
    val queryParams: Map[String, String] = QueryParams.get(queryString).mapValues{_.mkString("")}
    val queryParamsWithEdition = queryParams + ("edition" -> queryParams.getOrElse("edition", Edition.defaultEdition.id))

    val newSearch = queryString match {
      case Path(Seg("search" ::  Nil)) => {
        val search = LiveContentApi.search(edition)
          .showElements("all")
          .pageSize(20)
        val newSearch = queryParamsWithEdition.foldLeft(search){
          case (query, (key, value)) => query.stringParam(key, value)
        }.showFields(showFieldsQuery)
        newSearch.response map { r =>
          Result(
            curated           = Nil,
            editorsPicks      = Nil,
            mostViewed        = Nil,
            contentApiResults = r.results.map(Content(_)).map(validateContent)
          )
        } recover executeContentApiQueryRecovery
      }
      case Path(id)  => {
        val search = LiveContentApi.item(id, edition)
          .showElements("all")
          .showEditorsPicks(true)
          .pageSize(20)
        val newSearch = queryParamsWithEdition.foldLeft(search){
          case (query, (key, value)) => query.stringParam(key, value)
        }.showFields(showFieldsQuery)
        newSearch.response map { r =>
          Result(
            curated           = Nil,
            editorsPicks      = r.editorsPicks.map(Content(_)).map(validateContent),
            mostViewed        = r.mostViewed.map(Content(_)).map(validateContent),
            contentApiResults = r.results.map(Content(_)).map(validateContent)
          )
        } recover executeContentApiQueryRecovery
      }
    }

    newSearch onFailure {case t: Throwable => log.warn("Content API Query failed: %s: %s".format(queryString, t.toString))}
    newSearch
  } getOrElse Future.successful(Result(Nil, Nil, Nil, Nil))

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
      Result(
        curated           = Nil,
        editorsPicks      = Nil,
        mostViewed        = Nil,
        contentApiResults = Nil
      )
    }
    case apiError: com.gu.openplatform.contentapi.ApiError if apiError.httpStatus == 410 => {
      log.warn(s"Content API Error: 410 for ${apiError.httpMessage}")
      Result(
        curated           = Nil,
        editorsPicks      = Nil,
        mostViewed        = Nil,
        contentApiResults = Nil
      )
    }
    case e: Exception => {
      log.warn(s"ExecuteContentApiQueryRecovery: $e")
      throw e
    }
  }
}

object LiveCollections extends ParseCollection {
  def retrieveItemsFromCollectionJson(collectionJson: JsValue): Seq[CollectionItem] =
    (collectionJson \ "live").asOpt[Seq[JsObject]].getOrElse(Nil).map { trail =>
      CollectionItem(
        (trail \ "id").as[String],
        (trail \ "meta").asOpt[Map[String, JsValue]],
        (trail \ "frontPublicationDate").asOpt[DateTime])
    }

  override val client: ContentApiClient = LiveContentApi
}

object DraftCollections extends ParseCollection {
  def retrieveItemsFromCollectionJson(collectionJson: JsValue): Seq[CollectionItem] =
    (collectionJson \ "draft").asOpt[Seq[JsObject]].getOrElse(Nil).map { trail =>
      CollectionItem(
        (trail \ "id").as[String],
        (trail \ "meta").asOpt[Map[String, JsValue]],
        (trail \ "frontPublicationDate").asOpt[DateTime])
    }

  override val client: ContentApiClient = DraftContentApi
}
