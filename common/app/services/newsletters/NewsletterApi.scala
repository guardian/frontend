package services.newsletters

import com.gu.identity.model.{EmailEmbed, NewsletterIllustration}
import common.{BadConfigurationException, GuLogging}
import conf.Configuration._
import play.api.libs.json.{JsError, JsResult, JsSuccess, JsValue, Json}
import play.api.libs.ws.WSClient

import scala.concurrent.duration.DurationInt
import scala.concurrent.{ExecutionContext, Future}

case class NewsletterResponse(
    id: String,
    name: String,
    brazeNewsletterName: String,
    brazeSubscribeAttributeName: String,
    brazeSubscribeEventNamePrefix: String,
    theme: String,
    description: String,
    frequency: String,
    exactTargetListId: Int,
    listIdv1: Int,
    listId: Int,
    exampleUrl: Option[String],
    emailEmbed: EmailEmbed,
    illustration: Option[NewsletterIllustration] = None,
    signupPage: Option[String],
)

object NewsletterResponse {
  implicit val emailEmbedReads = Json.reads[EmailEmbed]
  implicit val newsletterIllustrationReads = Json.reads[NewsletterIllustration]
  implicit val newsletterResponseReads = Json.reads[NewsletterResponse]
}

case class GroupedNewsletterResponse(
    displayName: String,
    newsletters: List[NewsletterResponse],
)

object GroupedNewsletterResponse {
  implicit val groupedNewsletterResponseReads = Json.reads[GroupedNewsletterResponse]
}

// TODO: Find a better way to define this that means Frontend doesn't have knowledge of the fields returned.
case class GroupedNewslettersResponse(
    newsRoundups: GroupedNewsletterResponse,
    newsByTopic: GroupedNewsletterResponse,
    features: GroupedNewsletterResponse,
    sport: GroupedNewsletterResponse,
    culture: GroupedNewsletterResponse,
    lifestyle: GroupedNewsletterResponse,
    comment: GroupedNewsletterResponse,
    work: GroupedNewsletterResponse,
    fromThePapers: GroupedNewsletterResponse,
) {
  val toList: () => List[(String, List[NewsletterResponse])] = () =>
    List(
      newsRoundups.displayName -> newsRoundups.newsletters,
      newsByTopic.displayName -> newsByTopic.newsletters,
      features.displayName -> features.newsletters,
      sport.displayName -> sport.newsletters,
      culture.displayName -> culture.newsletters,
      lifestyle.displayName -> lifestyle.newsletters,
      comment.displayName -> comment.newsletters,
      work.displayName -> work.newsletters,
      fromThePapers.displayName -> fromThePapers.newsletters,
    )
}

object GroupedNewslettersResponse {
  implicit val groupedNewslettersResponseReads = Json.reads[GroupedNewslettersResponse]

  // Create an empty response to initialise the box
  val empty = GroupedNewslettersResponse(
    GroupedNewsletterResponse("News roundups", Nil),
    GroupedNewsletterResponse("News by topic", Nil),
    GroupedNewsletterResponse("Features", Nil),
    GroupedNewsletterResponse("Sport", Nil),
    GroupedNewsletterResponse("Culture", Nil),
    GroupedNewsletterResponse("Lifestyle", Nil),
    GroupedNewsletterResponse("Comment", Nil),
    GroupedNewsletterResponse("Work", Nil),
    GroupedNewsletterResponse("From the papers", Nil),
  )
}

case class NewsletterApi(wsClient: WSClient)(implicit executionContext: ExecutionContext)
    extends GuLogging
    with implicits.WSRequests {

  private def ensureHostSecure(host: String): String = host.replace("http:", "https:")

  private def getBody(path: String): Future[JsValue] = {
    val maybeJson: Option[Future[JsValue]] = for {
      host <- newsletterApi.host
      origin <- newsletterApi.origin
    } yield {
      val url = s"${ensureHostSecure(host)}/$path"
      log.info(s"Making request to newsletters API: $url")
      wsClient
        .url(url)
        .withRequestTimeout(10.seconds)
        .withHttpHeaders(("Origin", origin))
        .getOKResponse()
        .map(_.json)
    }

    maybeJson.getOrElse(
      Future.failed(new BadConfigurationException("Newsletters API host or origin not configured")),
    )
  }

  def getGroupedNewsletters(): Future[Either[String, GroupedNewslettersResponse]] = {
    getBody("newsletters/grouped").map { json =>
      {
        json.validate[GroupedNewslettersResponse] match {
          case succ: JsSuccess[GroupedNewslettersResponse] =>
            Right(succ.get)
          case err: JsError => Left(err.toString)
        }
      }
    }
  }

  def getNewsletters(): Future[Either[String, List[NewsletterResponse]]] = {
    getBody("newsletters").map { json =>
      json.validate[List[NewsletterResponse]] match {
        case succ: JsSuccess[List[NewsletterResponse]] =>
          Right(succ.get)
        case err: JsError => Left(err.toString)
      }
    }
  }

}
