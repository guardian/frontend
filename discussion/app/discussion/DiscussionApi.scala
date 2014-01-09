package discussion

import common.{ExecutionContexts, Logging}
import scala.concurrent.Future
import play.api.libs.json.{JsValue, JsArray, JsObject, JsNumber}
import play.api.libs.ws.Response
import discussion.model.{DiscussionKey, Profile, Comment, CommentCount, Switch}
import play.api.mvc.Headers
import discussion.util.Http

trait DiscussionApi extends Http with ExecutionContexts with Logging {

  protected def GET(url: String, headers: (String, String)*): Future[Response]

  protected val apiRoot: String
  protected val clientHeaderValue: String
  protected val pageSize: String = "10"

  def commentCounts(ids: String): Future[Seq[CommentCount]] = {
    def onError(response: Response) =
      s"Discussion API: Error loading comment count ids: $ids status: ${response.status} message: ${response.statusText}"
    val apiUrl = s"$apiRoot/getCommentCounts?short-urls=$ids"

    getJsonOrError(apiUrl, onError) map {
      json =>
        json.asInstanceOf[JsObject].fieldSet.toSeq map {
          case (id, JsNumber(i)) => CommentCount(id, i.toInt)
          case bad => throw new RuntimeException(s"never understood $bad")
        }
    }
  }

  private def getJsonForUri(key: DiscussionKey, apiUrl: String): Future[CommentPage] = {
    def onError(r: Response) =
      s"Discussion API: Error loading comments id: $key status: ${r.status} message: ${r.statusText}"

    getJsonOrError(apiUrl, onError) map {
      json =>
        val comments = (json \\ "comments")(0).asInstanceOf[JsArray].value map {
          commentJson =>  Comment(commentJson)
        }

        CommentPage(
          id = s"/$key",
          title = (json \ "discussion" \ "title").as[String],
          contentUrl = (json \ "discussion" \ "webUrl").as[String],
          comments = comments,
          commentCount = (json \ "discussion" \ "commentCount").as[Int],
          topLevelCommentCount = (json \ "discussion" \ "topLevelCommentCount").as[Option[Int]].getOrElse(0),
          commenterCount =  (json \ "discussion" \ "commenterCount").as[Option[Int]].getOrElse(0),
          currentPage = (json \ "currentPage").as[Int],
          pages = (json \ "pages").as[Int],
          orderBy = (json \ "orderBy").as[String],
          isClosedForRecommendation = (json \ "discussion" \ "isClosedForRecommendation").as[Boolean],
          switches = (json \ "switches").as[Seq[JsObject]] map { json => Switch(json) }
        )
    }
  }

  private def getCommentJsonForId(id: Int, apiUrl: String): Future[Comment] = {
    def onError(r: Response) =
      s"Error loading comment id: $id status: ${r.status} message: ${r.statusText}"

    getJsonOrError(apiUrl, onError) map {
      json => 
        val comment = (json \ "comment")
        Comment(comment)
    }
  }

  def commentFor(id: Int): Future[Comment] = {
    getCommentJsonForId(id, s"$apiRoot/comment/$id?displayResponses=true&displayThreaded=true")
  }

  def commentsFor(key: DiscussionKey, page: String, orderBy: String = "newest", allResponses: Boolean = false): Future[CommentPage] = {
    getJsonForUri(key, s"$apiRoot/discussion/$key?pageSize=$pageSize&page=$page&orderBy=$orderBy&showSwitches=true" + (if(allResponses) "" else "&maxResponses=3"))
  }

  def topCommentsFor(key: DiscussionKey): Future[CommentPage] = {
    getJsonForUri(key, s"$apiRoot/discussion/$key/topcomments?pageSize=$pageSize&page=1&orderBy=newest&showSwitches=true")
  }

  def commentContext(id: Int, orderBy: String = "newest"): Future[(DiscussionKey, String)] = {
    def onError(r: Response) =
      s"Discussion API: Cannot load comment context, status: ${r.status}, message: ${r.statusText}, response: ${r.body}"

    val apiUrl = s"$apiRoot/comment/$id/context?pageSize=$pageSize&orderBy=$orderBy"

    getJsonOrError(apiUrl, onError) map {
      json =>
        (DiscussionKey((json \ "discussionKey").as[String]), (json \ "page").as[Int].toString)
    }
  }

  def myProfile(headers: Headers): Future[Profile] = {
    def onError(r: Response) =
      s"Discussion API: Error loading profile, status: ${r.status}, message: ${r.statusText}, response: ${r.body}"
    val apiUrl = s"$apiRoot/profile/me"

    val authHeader = AuthHeaders.filterHeaders(headers).toSeq

    getJsonOrError(apiUrl, onError, authHeader: _*) map {
      json =>
        Profile(json)
    }
  }

  override protected def getJsonOrError(url: String, onError: (Response) => String, headers: (String, String)*) =
    super.getJsonOrError(url, onError, headers :+ guClientHeader: _*)

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
