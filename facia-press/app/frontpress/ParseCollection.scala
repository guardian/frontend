package services

import com.gu.facia.client.models.{Trail, _}
import com.gu.contentapi.client.model.{Content => ApiContent}
import common._
import conf.Switches.{FaciaToolCachedContentApiSwitch, FaciaTreats}
import conf.{Configuration, LiveContentApi}
import contentapi.{ContentApiClient, QueryDefaults}
import fronts.FrontsApi
import model.{Collection, _}
import org.apache.commons.codec.digest.DigestUtils._
import org.joda.time.DateTime
import performance._
import services.ParseCollectionJsonImplicits._
import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.Try

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

case class TrailId(get: String) extends AnyVal

trait ParseCollection extends ExecutionContexts with QueryDefaults with Logging {
  implicit def apiContentCodec = JsonCodecs.snappyCodec[ApiContent]

  implicit def resultCodec = JsonCodecs.snappyCodec[Result]

  val cacheDuration: FiniteDuration = 5.minutes

  val client: ContentApiClient
  def retrieveItemsFromCollectionJson(collection: com.gu.facia.client.models.CollectionJson): Seq[Trail]

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

  def getCollection(id: String, config: CollectionConfigJson, edition: Edition): Future[Collection] = {
    val collection: Future[Option[com.gu.facia.client.models.CollectionJson]] =
      FrontsApi.amazonClient.collection(id)
        .recover { case t: Throwable =>
          log.warn(s"Could not get Collection ID $id: $t")
          None
        }

    val curatedItems: Future[Seq[Content]] = collection.flatMap { collectionOption =>
      val items: Seq[Trail] =
        collectionOption.fold[Seq[Trail]](Nil)(retrieveItemsFromCollectionJson)
      getArticles(items, edition)
    }

    val treatsFuture: Future[Seq[Content]] =
      if (FaciaTreats.isSwitchedOn)
          collection.flatMap { collectionOption =>
            val items: Seq[Trail] =
              collectionOption.flatMap(_.treats).getOrElse(Nil)
            getArticles(items, edition)}
      else
        Future.successful(Nil)

    val executeDraftContentApiQuery: Future[Result] =
      config.apiQuery.map(executeContentApiQueryViaCache(_, edition)).getOrElse(Future.successful(Result.empty))

    for {
      executeRequest <- executeDraftContentApiQuery
      curatedRequest <- curatedItems
      collectionOption <- collection
      treats <- treatsFuture
    } yield Collection(
      curated = curatedRequest,
      editorsPicks = executeRequest.editorsPicks.map(makeContent),
      mostViewed = executeRequest.mostViewed.map(makeContent),
      results = executeRequest.contentApiResults.map(makeContent),
      treats = treats,
      displayName = collectionOption.flatMap(_.displayName),
      href = collectionOption.flatMap(_.href),
      lastUpdated = collectionOption.map(_.lastUpdated.toString()),
      updatedBy = collectionOption.map(_.updatedBy),
      updatedEmail = collectionOption.map(_.updatedEmail)
    )
  }

  def getSnapLatest(collectionItems: Seq[Trail]): Future[Map[String, com.gu.contentapi.client.model.Content]] = {
    val latestSnapSearches: Seq[String] = collectionItems
      .filter(c => c.meta.exists(_.snapType.exists(_ == "latest")))
      .flatMap(c => c.meta.flatMap(_.snapUri))

    val lastestSnaps = Future.traverse(latestSnapSearches) { id =>
      client.getResponse(LiveContentApi.item(id, Edition.defaultEdition)
        .showFields(showFieldsWithBodyQuery)
        .pageSize(1)
      ).map(_.results.headOption.map(id -> _))
    }
    .map(_.flatten)
    .map(_.toMap)

    lastestSnaps.onSuccess { case m => log.info(s"Successfully requested ${m.size} Dreamsnaps")}
    lastestSnaps.onFailure { case t: Throwable => log.info(s"Dreamsnaps request failed: $t")}
    lastestSnaps
  }

  def getArticles(collectionItems: Seq[Trail], edition: Edition): Future[Seq[Content]] = {
    val latestSnaps: Future[Map[String, com.gu.contentapi.client.model.Content]] = getSnapLatest(collectionItems)

    val itemIds: Seq[TrailId] =
      (collectionItems.map(_.id) ++ collectionItems.flatMap(retrieveSupportingLinks).map(_.id))
        .map(TrailId)
        .filterNot(t => Snap.isSnap(t.get))

    batchGetContentApiItems(itemIds, edition) flatMap { items =>
      latestSnaps map { ls =>
        collectionItems flatMap { collectionItem =>
          val supporting: List[Content] = retrieveSupportingLinks(collectionItem).flatMap({ collectionItem =>
            if (collectionItem.isSnap) {
              if (collectionItem.meta.exists(_.snapType.exists(_ == "latest")))
                None
              else
                Some(new Snap(
                  collectionItem.id,
                  Nil,
                  collectionItem.frontPublicationDate.map(new DateTime(_)).getOrElse(DateTime.now),
                  collectionItem.meta
                ))
            } else {
              items.get(TrailId(collectionItem.id)) map { item =>
                Content(
                  item,
                  Nil,
                  collectionItem.meta
                )
              }
            }
          })

          if (collectionItem.isSnap) {
            if (collectionItem.meta.exists(_.snapType.exists(_ == "latest")))
              ls.get(collectionItem.meta.flatMap(_.snapUri).getOrElse("")).map { item =>
                SnapLatest(
                  item.id,
                  Nil, //No Supporting for a latest snap
                  new DateTime(collectionItem.frontPublicationDate),
                  collectionItem.meta,
                  item.elements.getOrElse(Nil),
                  item.safeFields,
                  item.tags.map(Tag(_))
                )
              }
            else
              Some(new Snap(
                collectionItem.id,
                supporting,
                new DateTime(collectionItem.frontPublicationDate),
                collectionItem.meta
              ))
          } else {
            items.get(TrailId(collectionItem.id)) map { item =>
              validateContent(Content(
                item,
                supporting,
                collectionItem.meta
              ))
            }
          }
        }
      }
    }
  }

  private def batchGetContentApiItems(collectionItems: Seq[TrailId],
                                      edition: Edition): Future[Map[TrailId, ApiContent]] =
    Futures.batchedTraverse(collectionItems.grouped(Configuration.faciatool.frontPressItemSearchBatchSize).toSeq, Configuration.faciatool.frontPressItemBatchSize)({ collectionItems =>
      getContentApiItemFromCollectionItem(collectionItems, edition) map { items =>
          items.map { item =>
            item.fields.flatMap(_.get("internalContentCode")).map { internalContentCode =>
              TrailId(InternalContentCode.toFormattedInternalContentCode(internalContentCode)) -> item}
          }.flatten
        }
    }).map(_.flatten.toMap)

  private def getContentApiItemFromCollectionItem(collectionItems: Seq[TrailId],
                                                  edition: Edition): Future[Seq[ApiContent]] = {
    lazy val itemIds: Seq[String] = collectionItems.map(_.get)
    lazy val collectionIdsQuery: String = itemIds.mkString(",")
    lazy val response = client.getResponse(client.search(edition)
      .ids(collectionIdsQuery)
      .showFields(showFieldsWithBodyQuery)
      .pageSize(Configuration.faciatool.frontPressItemSearchBatchSize)
    ).map(Option.apply).recover {
      case apiError: com.gu.contentapi.client.GuardianContentApiError if apiError.httpStatus == 404 => {
        log.warn(s"Content API Error: 404 for collectionIds $collectionIdsQuery")
        None
      }
      case apiError: com.gu.contentapi.client.GuardianContentApiError if apiError.httpStatus == 410 => {
        log.warn(s"Content API Error: 410 for collectionIds $collectionIdsQuery")
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
        log.warn("%s: %s".format(collectionIdsQuery, t.toString))
        throw t
      }
    }.map(_.map(_.results).getOrElse(Nil))

    if (FaciaToolCachedContentApiSwitch.isSwitchedOn) {
      MemcachedFallback.withMemcachedFallBack(itemIds, cacheDuration)(response)
    }
    else {
      response
    }
  }

  private def retrieveSupportingLinks(collectionItem: Trail): List[SupportingItem] =
    collectionItem.meta.flatMap(_.supporting).getOrElse(Nil)

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
          client.getResponse(newSearch) map { searchResponse =>
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
          client.getResponse(newSearch) map { itemResponse =>
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
    case apiError: com.gu.contentapi.client.GuardianContentApiError if apiError.httpStatus == 404 => {
      log.warn(s"Content API Error: 404 for ${apiError.httpMessage}")
      Result.empty
    }
    case apiError: com.gu.contentapi.client.GuardianContentApiError if apiError.httpStatus == 410 => {
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
  def retrieveItemsFromCollectionJson(collection: com.gu.facia.client.models.CollectionJson): Seq[Trail] =
    collection.live

  override val client: ContentApiClient = LiveContentApi
}
