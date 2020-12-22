package services.newsletters

import com.gu.identity.model.{EmailEmbed, NewsletterIllustration}
import common.{BadConfigurationException, Logging}
import conf.Configuration._
import play.api.libs.json.{JsResult, JsValue, Json}
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
    emailEmbed: EmailEmbed,
    illustration: Option[NewsletterIllustration] = None,
)

case class GroupedNewsletterResponse(
    displayName: String,
    newsletters: List[NewsletterResponse],
)

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
)

case class NewsletterApi(wsClient: WSClient)(implicit executionContext: ExecutionContext)
    extends Logging
    with implicits.WSRequests {

  implicit val emailEmbedReads = Json.reads[EmailEmbed]

  implicit val newsletterIllustrationReads = Json.reads[NewsletterIllustration]

  implicit val newsletterResponseReads = Json.reads[NewsletterResponse]

  implicit val groupedNewsletterResponseReads = Json.reads[GroupedNewsletterResponse]

  implicit val groupedNewslettersReads = Json.reads[GroupedNewslettersResponse]

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

  def getGroupedNewsletters(): Future[JsResult[GroupedNewslettersResponse]] = {
    getBody("newsletters/grouped").map { json =>
      {
        json.validate[GroupedNewslettersResponse]
      }
    }
  }

  def getNewsletters(): Future[JsResult[List[NewsletterResponse]]] = {
    getBody("newsletters").map { json =>
      {
        json.validate[List[NewsletterResponse]]
      }
    }
  }

}
