package services

import common.FaciaMetrics.S3AuthorizationError
import common._
import conf.{ContentApi, Configuration}
import model.{Collection, Config, Content}
import play.api.libs.json.Json._
import play.api.libs.json.{JsObject, JsValue}
import play.api.libs.ws.Response
import scala.concurrent.Future
import scala.Some

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

trait ParseCollection extends ExecutionContexts with Logging {

  case class CollectionItem(id: String, metaData: Option[Map[String, JsValue]])

  //Curated and editorsPicks are the same, we will get rid of either
  case class Result(curated: List[Content], editorsPicks: List[Content], contentApiResults: List[Content])

  def requestCollection(id: String): Future[Response] = {
    val s3BucketLocation: String = s"${S3FrontsApi.location}/collection/$id/collection.json"
    log.info(s"loading running order configuration from: ${Configuration.frontend.store}/$s3BucketLocation")
    val request = SecureS3Request.urlGet(s3BucketLocation)
    request.withRequestTimeout(2000).get()
  }

  def getCollection(id: String, config: Config, edition: Edition, isWarmedUp: Boolean): Future[Collection] = {
    // get the running order from the apiwith
    val response = requestCollection(id)
    for {
      collectionList <- getCuratedList(response, edition, id, isWarmedUp)
      displayName    <- parseDisplayName(response).fallbackTo(Future.successful(None))
      contentApiList <- executeContentApiQuery(config.contentApiQuery, edition)
    } yield Collection(collectionList, contentApiList.editorsPicks, contentApiList.contentApiResults, displayName)
  }

  def getCuratedList(response: Future[Response], edition: Edition, id: String, isWarmedUp: Boolean): Future[List[Content]] = {
    val curatedList: Future[List[Content]] = parseResponse(response, edition, id)
    //Potential to fail the chain if we are warmed up
    if (isWarmedUp)
      curatedList
    else
      curatedList fallbackTo { Future.successful(Nil) }
  }

  private def parseDisplayName(response: Future[Response]): Future[Option[String]] = response.map {r =>
    (parse(r.body) \ "displayName").asOpt[String].filter(_.nonEmpty)
  }

  private def parseResponse(response: Future[Response], edition: Edition, id: String): Future[List[Content]] = {
    response.flatMap { r =>
      r.status match {
        case 200 =>
          try {
            val bodyJson = parse(r.body)

            // extract the articles
            val articles: Seq[CollectionItem] = (bodyJson \ "live").as[Seq[JsObject]] map { trail =>
              CollectionItem((trail \ "id").as[String], (trail \ "meta").asOpt[Map[String, JsValue]])
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
          Future(Nil)
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
      val results = collectionItems.foldLeft(Future[List[Content]](Nil)){(foldListFuture, collectionItem) =>
        lazy val supportingAsContent: Future[List[Content]] = {
          lazy val supportingLinks: List[CollectionItem] = retrieveSupportingLinks(collectionItem)
          if (!hasParent) getArticles(supportingLinks, edition, hasParent=true) else Future.successful(Nil)
        }
        val response = ContentApi.item(collectionItem.id, edition).showFields("all").response

        response.onFailure{case t: Throwable => log.warn("%s: %s".format(collectionItem.id, t.toString))}
        supportingAsContent.onFailure{case t: Throwable => log.warn("Supporting links: %s: %s".format(collectionItem.id, t.toString))}

        for {
          contentList <- foldListFuture
          itemResponse <- response
          supporting <- supportingAsContent
        } yield {
          itemResponse.content.map(Content(_, supporting, collectionItem.metaData)).map(_ +: contentList).getOrElse(contentList)
        }
      }
      val sorted = results map { _.sortBy(t => collectionItems.indexWhere(_.id == t.id))}
      sorted
    }
  }

  private def retrieveSupportingLinks(collectionItem: CollectionItem): List[CollectionItem] =
    collectionItem.metaData.map(_.get("supporting").flatMap(_.asOpt[List[JsValue]]).getOrElse(Nil)
      .map(json => CollectionItem((json \ "id").as[String], (json \ "meta").asOpt[Map[String, JsValue]]))
    ).getOrElse(Nil)

  def executeContentApiQuery(s: Option[String], edition: Edition): Future[Result] = s filter(_.nonEmpty) map { queryString =>
    val queryParams: Map[String, String] = QueryParams.get(queryString).mapValues{_.mkString("")}
    val queryParamsWithEdition = queryParams + ("edition" -> queryParams.getOrElse("edition", Edition.defaultEdition.id))

    val newSearch = queryString match {
      case Path(Seg("search" ::  Nil)) => {
        val search = ContentApi.search(edition)
          .showElements("all")
          .pageSize(20)
        val newSearch = queryParamsWithEdition.foldLeft(search){
          case (query, (key, value)) => query.stringParam(key, value)
        }.showFields("all")
        newSearch.response map { r =>
          Result(Nil, Nil, r.results.map(Content(_)))
        }
      }
      case Path(id)  => {
        val search = ContentApi.item(id, edition)
          .showElements("all")
          .showEditorsPicks(true)
          .pageSize(20)
        val newSearch = queryParamsWithEdition.foldLeft(search){
          case (query, (key, value)) => query.stringParam(key, value)
        }.showFields("all")
        newSearch.response map { r =>
          Result(Nil, r.editorsPicks.map(Content(_)), r.results.map(Content(_)))
        }
      }
    }

    newSearch onFailure {case t: Throwable => log.warn("Content API Query failed: %s: %s".format(queryString, t.toString))}
    newSearch
  } getOrElse Future(Result(Nil, Nil, Nil))

}