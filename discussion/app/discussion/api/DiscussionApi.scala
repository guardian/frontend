package discussion.api

import java.net.URLEncoder
import io.lemonlabs.uri.Url
import common.GuLogging
import conf.Configuration
import discussion.model.{CommentCount, _}
import discussion.util.Http
import play.api.libs.json.{JsNull, JsNumber, JsObject}
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.mvc.{Cookie, Headers, RequestHeader}

import scala.concurrent.duration._
import conf.switches.Switches._
import io.lemonlabs.uri.config.{ExcludeNones, UriConfig}
import io.lemonlabs.uri.typesafe.QueryKey.stringQueryKey

import scala.concurrent.{ExecutionContext, Future}

trait DiscussionApiLike extends Http with GuLogging {

  protected def GET(url: String, headers: (String, String)*)(implicit
      executionContext: ExecutionContext,
  ): Future[WSResponse]

  protected val apiRoot: String
  protected val clientHeaderValue: String
  protected val defaultParams = List("api-key" -> Some("dotcom"))
  protected val pageSize: String = "10"

  def endpointUrl(relativePath: String, params: List[(String, Option[String])] = List()): String = { //Using List for params because order is important for caching reason
    implicit val config: UriConfig = UriConfig(renderQuery = ExcludeNones)
    Url.parse(apiRoot + relativePath).addParams(params ++ defaultParams).toString()
  }

  def commentCounts(ids: String)(implicit executionContext: ExecutionContext): Future[Seq[CommentCount]] = {
    def onError(response: WSResponse) =
      s"Discussion API: Error loading comment count ids: $ids status: ${response.status} message: ${response.statusText}"
    val apiUrl = endpointUrl("/getCommentCounts", List(("short-urls", Some(ids))))

    getJsonOrError(apiUrl, onError) map { json =>
      json.asInstanceOf[JsObject].fieldSet.toSeq map {
        case (id, JsNumber(i)) => CommentCount(id, i.toInt)
        case bad               => throw new RuntimeException(s"never understood $bad")
      }
    }
  }

  def commentFor(id: Int, displayThreaded: Option[String] = None)(implicit
      executionContext: ExecutionContext,
  ): Future[Comment] = {
    val parameters = List("displayResponses" -> Some("true"), "displayThreaded" -> displayThreaded)
    val url = endpointUrl(s"/comment/$id", parameters)
    getCommentJsonForId(id, url)
  }

  def commentsFor(key: DiscussionKey, params: DiscussionParams)(implicit
      executionContext: ExecutionContext,
  ): Future[DiscussionComments] = {
    val parameters = List(
      "pageSize" -> Some(params.pageSize),
      "page" -> Some(params.page),
      "orderBy" -> Some(params.orderBy),
      "displayThreaded" -> (params.displayThreaded match {
        case false => Some("false")
        case _     => None
      }),
      "showSwitches" -> Some("true"),
      "maxResponses" -> params.maxResponses,
    )
    val path = s"/discussion/$key" + (if (params.topComments) "/topcomments" else "")
    val url = endpointUrl(path, parameters)

    getJsonForUri(key, url)
  }

  def commentContext(id: Int, params: DiscussionParams)(implicit
      executionContext: ExecutionContext,
  ): Future[(DiscussionKey, String)] = {
    def onError(r: WSResponse) =
      s"Discussion API: Cannot load comment context, status: ${r.status}, message: ${r.statusText}, response: ${r.body}"

    val parameters = List(
      "pageSize" -> Some(params.pageSize),
      "orderBy" -> Some(params.orderBy),
      "displayThreaded" -> (params.displayThreaded match {
        case false => Some("false")
        case _     => None
      }),
    )
    val path = s"/comment/$id/context"
    val apiUrl = endpointUrl(path, parameters)

    getJsonOrError(apiUrl, onError) map { json =>
      (DiscussionKey((json \ "discussionKey").as[String]), (json \ "page").as[Int].toString)
    }
  }

  def myProfile(headers: Headers)(implicit executionContext: ExecutionContext): Future[Profile] = {
    def onError(r: WSResponse) =
      s"Discussion API: Error loading profile, status: ${r.status}, message: ${r.statusText}, response: ${r.body}"
    val apiUrl = endpointUrl("/profile/me")
    val authHeader = AuthHeaders.filterHeaders(headers).toSeq

    getJsonOrError(apiUrl, onError, authHeader: _*) map { json =>
      Profile(json)
    }
  }

  def profileComments(userId: String, page: String, orderBy: String = "newest", picks: Boolean = false)(implicit
      executionContext: ExecutionContext,
  ): Future[ProfileComments] = {
    def onError(r: WSResponse) =
      s"Discussion API: Error loading comments for User $userId, status: ${r.status}, message: ${r.statusText}, response: ${r.body}"
    val parameters = List(
      "pageSize" -> Some(pageSize),
      "page" -> Some(page),
      "orderBy" -> Some(orderBy),
      "showSwitches" -> Some("true"),
      "displayHighlighted" -> (picks match {
        case true  => Some("true")
        case false => None
      }),
    )
    val path = s"/profile/$userId/comments"
    val apiUrl = endpointUrl(path, parameters)

    getJsonOrError(apiUrl, onError) map { json =>
      ProfileComments(json)
    }
  }

  def profileReplies(userId: String, page: String)(implicit
      executionContext: ExecutionContext,
  ): Future[ProfileComments] = {
    def onError(r: WSResponse) =
      s"Discussion API: Error loading replies for User $userId, status: ${r.status}, message: ${r.statusText}, response: ${r.body}"
    val parameters = List(
      "pageSize" -> Some(pageSize),
      "page" -> Some(page),
      "orderBy" -> Some("newest"),
      "showSwitches" -> Some("true"),
    )
    val path = s"/profile/$userId/replies"
    val apiUrl = endpointUrl(path, parameters)

    getJsonOrError(apiUrl, onError) map { json =>
      ProfileReplies(json)
    }
  }

  def profileSearch(userId: String, q: String, page: String)(implicit
      executionContext: ExecutionContext,
  ): Future[ProfileComments] = {
    def onError(r: WSResponse) =
      s"Discussion API: Error loading search User $userId, Query: $q. status: ${r.status}, message: ${r.statusText}, response: ${r.body}"
    val parameters = List("q" -> Some(URLEncoder.encode(q, "UTF-8")), "page" -> Some(page))
    val path = s"/search/profile/$userId"
    val apiUrl = endpointUrl(path, parameters)

    getJsonOrError(apiUrl, onError) map { json =>
      ProfileComments(json)
    }
  }

  def profileDiscussions(userId: String, page: String)(implicit
      executionContext: ExecutionContext,
  ): Future[ProfileDiscussions] = {
    def onError(r: WSResponse) =
      s"Discussion API: Error loading discussions for User $userId, status: ${r.status}, message: ${r.statusText}, response: ${r.body}"
    val parameters = List(
      "pageSize" -> Some(pageSize),
      "page" -> Some(page),
      "orderBy" -> Some("newest"),
      "showSwitches" -> Some("true"),
    )
    val path = s"/profile/$userId/discussions"
    val apiUrl = endpointUrl(path, parameters)

    getJsonOrError(apiUrl, onError) map { json =>
      ProfileDiscussions(json)
    }
  }

  private def getJsonForUri(key: DiscussionKey, apiUrl: String)(implicit
      executionContext: ExecutionContext,
  ): Future[DiscussionComments] = {
    def onError(r: WSResponse) =
      s"Discussion API: Error loading comments id: $key status: ${r.status} message: ${r.statusText} url: $apiUrl"

    getJsonOrError(apiUrl, onError) map { json =>
      DiscussionComments(json)
    }
  }

  private def getCommentJsonForId(id: Int, apiUrl: String)(implicit
      executionContext: ExecutionContext,
  ): Future[Comment] = {
    def onError(r: WSResponse) =
      s"Error loading comment id: $id status: ${r.status} message: ${r.statusText}"

    getJsonOrError(apiUrl, onError) map { json =>
      val obj = (json \ "comment").getOrElse(JsNull)
      Comment(obj, None, None)
    }
  }

  override protected def getJsonOrError(url: String, onError: (WSResponse) => String, headers: (String, String)*)(
      implicit executionContext: ExecutionContext,
  ) = {
    failIfDisabled().flatMap(_ => super.getJsonOrError(url, onError, headers :+ guClientHeader: _*))
  }

  private def guClientHeader = ("GU-Client", clientHeaderValue)

  def abuseReportToMap(abuseReport: DiscussionAbuseReport): Map[String, Seq[String]] = {
    Map(
      "categoryId" -> Seq(abuseReport.categoryId.toString),
      "commentId" -> Seq(abuseReport.commentId.toString),
      "reason" -> abuseReport.reason.toSeq,
      "email" -> abuseReport.email.toSeq,
    )
  }

  def postAbuseReport(abuseReport: DiscussionAbuseReport, cookie: Option[Cookie])(implicit
      executionContext: ExecutionContext,
  ): Future[WSResponse] = {
    val url = s"${apiRoot}/comment/${abuseReport.commentId}/reportAbuse"
    val headers = Seq("D2-X-UID" -> conf.Configuration.discussion.d2Uid, guClientHeader)
    if (cookie.isDefined) { headers :+ ("Cookie" -> s"SC_GU_U=${cookie.get}") }
    failIfDisabled().flatMap(_ =>
      wsClient.url(url).withHttpHeaders(headers: _*).withRequestTimeout(2.seconds).post(abuseReportToMap(abuseReport)),
    )
  }

  private def failIfDisabled()(implicit executionContext: ExecutionContext): Future[Unit] = {
    if (EnableDiscussionSwitch.isSwitchedOn)
      Future.successful(())
    else
      Future.failed(ServiceUnavailableException("DAPI is currently unavailable from Frontend"))
  }
}

class DiscussionApi(val wsClient: WSClient) extends DiscussionApiLike {
  override protected val apiRoot = Configuration.discussion.apiRoot

  override protected lazy val clientHeaderValue: String = Configuration.discussion.apiClientHeader
}

object AuthHeaders {
  val guIdToken = "GU-IdentityToken"
  val cookie = "Cookie"
  val all = Set(guIdToken, cookie)

  def filterHeaders(headers: Headers): Map[String, String] =
    headers.toSimpleMap.view.filterKeys(all.contains).toMap
}

case class DiscussionParams(
    orderBy: String = "newest",
    page: String = "1",
    pageSize: String = "50",
    topComments: Boolean = false,
    maxResponses: Option[String] = None,
    displayThreaded: Boolean = false,
)

object DiscussionParams extends {
  def apply(request: RequestHeader): DiscussionParams = {
    DiscussionParams(
      orderBy = request.getQueryString("orderBy").getOrElse("newest"),
      page = request.getQueryString("page").getOrElse("1"),
      pageSize = request.getQueryString("pageSize").getOrElse("50"),
      maxResponses = request.getQueryString("maxResponses"),
      displayThreaded = request.getQueryString("displayThreaded").exists(_ == "true"),
    )
  }
}
