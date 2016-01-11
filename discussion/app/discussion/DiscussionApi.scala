package discussion

import java.net.URLEncoder

import common.{ExecutionContexts, Logging}
import scala.concurrent.Future
import discussion.model._
import play.api.mvc.{RequestHeader, Headers}
import discussion.util.Http
import play.api.libs.ws.WSResponse
import play.api.libs.json.{JsNull, JsNumber, JsObject}
import discussion.model.CommentCount
import com.netaporter.uri.dsl._

trait DiscussionApi extends Http with ExecutionContexts with Logging {

  protected def GET(url: String, headers: (String, String)*): Future[WSResponse]

  protected val apiRoot: String
  protected val clientHeaderValue: String
  protected val defaultParams = List("api-key" -> "dotcom")
  protected val pageSize: String = "10"

  def endpointUrl(relativePath: String, params: List[(String, Any)] = List()) = { //Using List for params because order is important for caching reason
    (apiRoot + relativePath).addParams(params ++ defaultParams).toString()
  }

  def commentCounts(ids: String): Future[Seq[CommentCount]] = {
    def onError(response: WSResponse) =
      s"Discussion API: Error loading comment count ids: $ids status: ${response.status} message: ${response.statusText}"
    val apiUrl = endpointUrl("/getCommentCounts", List(("short-urls", ids)))

    getJsonOrError(apiUrl, onError) map {
      json =>
        json.asInstanceOf[JsObject].fieldSet.toSeq map {
          case (id, JsNumber(i)) => CommentCount(id, i.toInt)
          case bad => throw new RuntimeException(s"never understood $bad")
        }
    }
  }

  def commentFor(id: Int, displayThreaded: Option[String]  = None): Future[Comment] = {
    val parameters = List(
      "displayResponses" -> "true",
      "displayThreaded" -> displayThreaded)
    val url = endpointUrl(s"/comment/$id", parameters)
    getCommentJsonForId(id, url)
  }

  def commentsFor(key: DiscussionKey, params: DiscussionParams): Future[DiscussionComments] = {
    val parameters = List(
      "pageSize" -> params.pageSize,
      "page" -> params.page,
      "orderBy" -> params.orderBy,
      "displayThreaded" -> (params.displayThreaded match {
        case false => "false"
        case _ => None}),
      "showSwitches" -> "true")
    val path = s"/discussion/$key" + (if(params.topComments) "/topcomments" else "")
    val url = endpointUrl(path, parameters)

    getJsonForUri(key, url)
  }

  def commentContext(id: Int, params: DiscussionParams): Future[(DiscussionKey, String)] = {
    def onError(r: WSResponse) =
      s"Discussion API: Cannot load comment context, status: ${r.status}, message: ${r.statusText}, response: ${r.body}"

    val parameters = List(
      "pageSize" -> params.pageSize,
      "orderBy" -> params.orderBy,
      "displayThreaded" -> (params.displayThreaded match {
        case false => "false"
        case _ => None}))
    val path = s"/comment/$id/context"
    val apiUrl = endpointUrl(path, parameters)

    getJsonOrError(apiUrl, onError) map { json =>
        (DiscussionKey((json \ "discussionKey").as[String]), (json \ "page").as[Int].toString)
    }
  }

  def myProfile(headers: Headers): Future[Profile] = {
    def onError(r: WSResponse) =
      s"Discussion API: Error loading profile, status: ${r.status}, message: ${r.statusText}, response: ${r.body}"
    val apiUrl = endpointUrl("/profile/me")
    val authHeader = AuthHeaders.filterHeaders(headers).toSeq

    getJsonOrError(apiUrl, onError, authHeader: _*) map {
      json =>
        Profile(json)
    }
  }

  def profileComments(userId: String, page: String, orderBy: String = "newest", picks: Boolean = false): Future[ProfileComments] = {
    def onError(r: WSResponse) =
      s"Discussion API: Error loading comments for User $userId, status: ${r.status}, message: ${r.statusText}, response: ${r.body}"
    val parameters = List(
      "pageSize" -> pageSize,
      "page" -> page,
      "orderBy" -> orderBy,
      "showSwitches" -> "true",
      "displayHighlighted" -> (picks match {
        case true => "true"
        case false => None
      }))
    val path = s"/profile/$userId/comments"
    val apiUrl = endpointUrl(path, parameters)

    getJsonOrError(apiUrl, onError) map {
      json => ProfileComments(json)
    }
  }

  def profileReplies(userId: String, page: String): Future[ProfileComments] = {
    def onError(r: WSResponse) =
      s"Discussion API: Error loading replies for User $userId, status: ${r.status}, message: ${r.statusText}, response: ${r.body}"
    val parameters = List(
      "pageSize" -> pageSize,
      "page" -> page,
      "orderBy" -> "newest",
      "showSwitches" -> "true")
    val path = s"/profile/$userId/replies"
    val apiUrl = endpointUrl(path, parameters)

    getJsonOrError(apiUrl, onError) map {
      json => ProfileReplies(json)
    }
  }

  def profileSearch(userId: String, q: String, page: String): Future[ProfileComments] = {
    def onError(r: WSResponse) =
      s"Discussion API: Error loading search User $userId, Query: $q. status: ${r.status}, message: ${r.statusText}, response: ${r.body}"
    val parameters = List(
      "q" -> URLEncoder.encode(q, "UTF-8"),
      "page" -> page)
    val path = s"/search/profile/$userId"
    val apiUrl = endpointUrl(path, parameters)

    getJsonOrError(apiUrl, onError) map {
      json => ProfileComments(json)
    }
  }

  def profileDiscussions(userId: String, page: String): Future[ProfileDiscussions] = {
    def onError(r: WSResponse) =
      s"Discussion API: Error loading discussions for User $userId, status: ${r.status}, message: ${r.statusText}, response: ${r.body}"
    val parameters = List(
      "pageSize" -> pageSize,
      "page" -> page,
      "orderBy" -> "newest",
      "showSwitches" -> "true")
    val path = s"/profile/$userId/discussions"
    val apiUrl = endpointUrl(path, parameters)

    getJsonOrError(apiUrl, onError) map {
      json => ProfileDiscussions(json)
    }
  }

  private def getJsonForUri(key: DiscussionKey, apiUrl: String): Future[DiscussionComments] = {
    def onError(r: WSResponse) =
      s"Discussion API: Error loading comments id: $key status: ${r.status} message: ${r.statusText} url: $apiUrl"

    getJsonOrError(apiUrl, onError) map {
      json => DiscussionComments(json)}
  }

  private def getCommentJsonForId(id: Int, apiUrl: String): Future[Comment] = {
    def onError(r: WSResponse) =
      s"Error loading comment id: $id status: ${r.status} message: ${r.statusText}"

    getJsonOrError(apiUrl, onError) map { json =>
      val obj = (json \ "comment").getOrElse(JsNull)
      Comment(obj, None, None)
    }
  }

  override protected def getJsonOrError(url: String, onError: (WSResponse) => String, headers: (String, String)*) = {
    println(url)
    super.getJsonOrError(url, onError, headers :+ guClientHeader: _*)
  }

  private def guClientHeader = ("GU-Client", clientHeaderValue)
}

object AuthHeaders {
  val guIdToken = "GU-IdentityToken"
  val cookie = "Cookie"
  val all = Set(guIdToken, cookie)

  def filterHeaders(headers: Headers): Map[String, String] = headers.toSimpleMap filterKeys {
    all.contains
  }
}

case class DiscussionParams(
  orderBy: String = "newest",
  page: String = "1",
  pageSize: String = "50",
  topComments: Boolean = false,
  maxResponses: Option[String] = None,
  displayThreaded: Boolean = false)

object DiscussionParams extends {
  def apply(request: RequestHeader): DiscussionParams = {
    DiscussionParams(
      orderBy = request.getQueryString("orderBy").getOrElse("newest"),
      page = request.getQueryString("page").getOrElse("1"),
      pageSize = request.getQueryString("pageSize").getOrElse("50"),
      maxResponses = request.getQueryString("maxResponses"),
      displayThreaded = request.getQueryString("displayThreaded").exists(_ == "true")
    )
  }
}
