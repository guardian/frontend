package discussion

import common.{ExecutionContexts, Logging}
import common.DiscussionMetrics.DiscussionHttpTimingMetric
import conf.Switches.ShortDiscussionSwitch
import play.api.libs.json._
import System.currentTimeMillis
import scala.concurrent.Future
import play.api.libs.json.JsArray
import play.api.libs.ws.Response
import play.api.libs.json.JsObject
import play.api.libs.json.JsNumber
import model.{Comment, CommentCount}

trait DiscussionApi extends ExecutionContexts with Logging {

  protected def GET(url: String): Future[Response]
  protected val apiRoot: String

  def commentCounts(ids: String): Future[Seq[CommentCount]] = {
    def onError(response: Response) =
      s"Error loading comment count ids: $ids status: ${response.status} message: ${response.statusText}"
    val apiUrl = s"$apiRoot/getCommentCounts?short-urls=$ids"

    getJsonOrError(apiUrl, onError) map {
      json =>
          json.asInstanceOf[JsObject].fieldSet.toSeq map{
            case (id, JsNumber(i)) => CommentCount(id , i.toInt)
            case bad => throw new RuntimeException(s"never understood $bad")
          }
    }
  }

  def commentsFor(key: String, page: String) = {
    val size = if (ShortDiscussionSwitch.isSwitchedOn) 10 else 50
    val apiUrl = s"$apiRoot/discussion/$key?pageSize=$size&page=$page&orderBy=oldest&showSwitches=true"

    def onError(r: Response) =
      s"Error loading comments id: $key status: ${r.status} message: ${r.statusText}"

    getJsonOrError(apiUrl, onError) map {
      json =>
        val comments = (json \\ "comments")(0).asInstanceOf[JsArray].value map {
          commentJson =>
            val responses = (commentJson \\ "responses").headOption map {
              responsesJson =>
                responsesJson.asInstanceOf[JsArray].value map {
                  responseJson =>
                    Comment(responseJson)
                }
            } getOrElse Nil
            Comment(commentJson, responses)
        }

        CommentPage(
          id = s"discussion/$key",
          title = (json \ "discussion" \ "title").as[String],
          contentUrl = (json \ "discussion" \ "webUrl").as[String],
          comments = comments,
          currentPage = (json \ "currentPage").as[Int],
          pages = (json \ "pages").as[Int],
          isClosedForRecommendation = (json \ "discussion" \ "isClosedForRecommendation").as[Boolean]
        )
    }
  }

  protected def getJsonOrError(url: String, onError: (Response) => String):Future[JsValue] = {
    val start = currentTimeMillis()
    GET(url) map {
      response =>
        DiscussionHttpTimingMetric.recordTimeSpent(currentTimeMillis - start)

        response.status match {
          case 200 =>
            Json.parse(response.body)

          case _ =>
            log.error(onError(response))
            throw new RuntimeException("Error from Discussion API")
        }
    }
  }

}


