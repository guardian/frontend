package discussion

import common.{ExecutionContexts, Logging}
import common.DiscussionMetrics.DiscussionHttpTimingMetric
import conf.Switches.ShortDiscussionSwitch
import model._
import play.api.libs.ws.{Response, WS}
import play.api.libs.json.{JsNumber, JsObject, JsArray, Json}
import System.currentTimeMillis
import scala.concurrent.Future

case class CommentPage(
  override val id: String,
  title: String,
  comments: Seq[Comment],
  contentUrl: String,
  currentPage: Int,
  pages: Int,
  isClosedForRecommendation: Boolean
) extends Page(id = id, section = "Global", webTitle = title, analyticsName = s"GFE:Article:Comment discussion page $currentPage") {
  lazy val hasMore: Boolean = currentPage < pages
}

trait DiscussionApi extends ExecutionContexts with Logging {

  import conf.Configuration.discussion.apiRoot
  protected def GET(url: String): Future[Response] = WS.url(url).withTimeout(2000).get()

  def commentCounts(ids: String) = {

    val apiUrl = s"$apiRoot/getCommentCounts?short-urls=$ids"

    val start = currentTimeMillis

    GET(apiUrl).map{ response =>

      DiscussionHttpTimingMetric.recordTimeSpent(currentTimeMillis - start)

      response.status match {

        case 200 =>
          val json = Json.parse(response.body).asInstanceOf[JsObject].fieldSet.toSeq
          json.map{
            case (id, JsNumber(i)) => CommentCount(id , i.toInt)
            case bad => throw new RuntimeException(s"never understood $bad")
          }
        case other =>
          log.error(s"Error loading comment counts id: $ids status: $other message: ${response.statusText}")
          throw new RuntimeException("Error from discussion API")
      }
    }
  }

  def commentsFor(id: String, page: String) = {

    val size = if (ShortDiscussionSwitch.isSwitchedOn) 10 else 50

    val apiUrl = s"$apiRoot/discussion/$id?pageSize=$size&page=$page&orderBy=oldest&showSwitches=true"

    val start = currentTimeMillis

    GET(apiUrl).map{ response =>

      DiscussionHttpTimingMetric.recordTimeSpent(currentTimeMillis - start)

      response.status match {

        case 200 =>

          val json = Json.parse(response.body)

          val comments = (json \\ "comments")(0).asInstanceOf[JsArray].value.map{ commentJson =>
            val responses = (commentJson \\ "responses").headOption.map(_.asInstanceOf[JsArray].value.map(responseJson => Comment(responseJson))).getOrElse(Nil)
            Comment(commentJson, responses)
          }

          CommentPage(
            id = s"discussion/$id",
            title = (json \ "discussion" \ "title").as[String],
            contentUrl = (json \ "discussion" \ "webUrl").as[String],
            comments = comments,
            currentPage =  (json \ "currentPage").as[Int],
            pages = (json \ "pages").as[Int],
            isClosedForRecommendation = (json \ "discussion" \ "isClosedForRecommendation").as[Boolean]
          )

        case other =>
          log.error(s"Error loading comments id: $id status: $other message: ${response.statusText}")
          throw new RuntimeException("Error from discussion API")
      }
    }
  }
}


