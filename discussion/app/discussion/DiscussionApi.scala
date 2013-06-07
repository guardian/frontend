package discussion

import common.{InBodyLink, ExecutionContexts, Logging}
import play.api.libs.ws.WS
import play.api.libs.json.{JsValue, JsArray, Json}
import model._
import org.joda.time.DateTime

// TODO
case class CommentPage(
  override val id: String,
  title: String,
  comments: Seq[Comment],
  contentUrl: String,
  currentPage: Int,
  pages: Int
) extends Page(canonicalUrl = None, id = id, section = "Global", webTitle = title, analyticsName = s"GFE:Article:Comment discussion page $currentPage") {
  lazy val hasMore: Boolean = currentPage < pages
}

trait DiscussionApi extends ExecutionContexts with Logging {

  def commentsFor(id: String, page: String) = {

    val apiUrl = s"http://discussion.guardianapis.com/discussion-api/discussion/$id?pageSize=50&page=$page"

    WS.url(apiUrl).withTimeout(2000).get().map{ response =>

      response.status match {

        case 200 =>

          val json = Json.parse(response.body)

          val comments = (json \\ "comments")(0).asInstanceOf[JsArray].value.map{ commentJson =>
            val responses = (commentJson \\ "responses")(0).asInstanceOf[JsArray].value.map(responseJson => Comment(responseJson))
            Comment(commentJson, responses)
          }

          CommentPage(
            id = s"discussion/$id",
            title = (json \ "discussion" \ "title").as[String],
            contentUrl = InBodyLink((json \ "discussion" \ "webUrl").as[String]),
            comments = comments,
            currentPage =  (json \ "currentPage").as[Int],
            pages = (json \ "pages").as[Int]
          )

        case other =>
          log.error(s"Error loading comments id: $id status: $other message: ${response.statusText}")
          throw new RuntimeException("Error from discussion API")
      }

    }

  }

}


