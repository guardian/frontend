package discussion

import common.{InBodyLink, ExecutionContexts, Logging}
import play.api.libs.ws.WS
import play.api.libs.json.{JsValue, JsArray, Json}
import model._
import org.joda.time.DateTime

case class Badge(
  name: String
)

case class Profile(
  avatar: String,
  displayName: String,
  isStaff: Boolean = false,
  isContributor: Boolean = false
)

case class Comment(
  body: String,
  responses: Seq[Comment],
  profile: Profile,
  date: DateTime,
  isHighlighted: Boolean
)

object Comment{
  def apply(json: JsValue): Comment = Comment(json, Nil)
  def apply(json: JsValue, responses: Seq[Comment]): Comment = Comment(
    body = (json \ "body").as[String],
    responses = responses,
    profile = Profile(
                (json \ "userProfile" \ "avatar").as[String],
                (json \ "userProfile" \ "displayName").as[String]
                //(json \ "userProfile" \ "badge").as[List[Badge]].exists(_.name == "Staff"),
                //(json \ "userProfile" \ "badge").as[List[Badge]].exists(_.name == "Contributor")
              ),
    date = (json \ "isoDateTime").as[String].parseISODateTimeNoMillis,
    isHighlighted = (json \ "isHighlighted").as[Boolean]
  )
}

// TODO
case class CommentPage(
  title: String,
  comments: Seq[Comment],
  contentUrl: String
) extends Page(canonicalUrl = None, id = "TODO", section = "TODO", webTitle = title, analyticsName = "TODO")

trait DiscussionApi extends ExecutionContexts with Logging {

  def commentsFor(id: String) = {

    val apiUrl = s"http://discussion.guardianapis.com/discussion-api/discussion/$id?pageSize=30"

    WS.url(apiUrl).withTimeout(2000).get().map{ response =>

      response.status match {

        case 200 =>

          val json = Json.parse(response.body)

          val comments = (json \\ "comments")(0).asInstanceOf[JsArray].value.map{ c =>
            val responses = (c \\ "responses")(0).asInstanceOf[JsArray].value.map(r => Comment(r))
            Comment(c, responses)
          }

          CommentPage(
            title = (json \ "discussion" \ "title").as[String],
            contentUrl = InBodyLink((json \ "discussion" \ "webUrl").as[String]),
            comments = comments
          )

        case other =>
          log.error(s"Error loading comments id: $id status: $other message: ${response.statusText}")
          throw new RuntimeException("Error from content API")
      }

    }

  }




}


