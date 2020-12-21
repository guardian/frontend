package services

import com.gu.identity.model.{
  EmailEmbed,
  EmailNewsletter,
  GroupedNewsletter,
  GroupedNewsletters,
  NewsletterIllustration,
}
import common.{BadConfigurationException, Logging}
import play.api.libs.json.{JsResult, JsValue, Json}
import play.api.libs.ws.WSClient
import conf.Configuration._

import scala.concurrent.duration.DurationInt
import scala.concurrent.{ExecutionContext, Future}

case class NewsletterApi(wsClient: WSClient)(implicit executionContext: ExecutionContext)
    extends Logging
    with implicits.WSRequests {

  implicit val emailEmbedReads = Json.reads[EmailEmbed]

  implicit val newsletterIllustrationReads = Json.reads[NewsletterIllustration]

  implicit val newsletterReads = Json.reads[EmailNewsletter]

  implicit val groupedNewsletterReads = Json.reads[GroupedNewsletter]

  implicit val groupedNewslettersReads = Json.reads[GroupedNewsletters]

  private def ensureHostSecure(host: String): String = host.replace("http:", "https:")

  private def getBody(path: String): Future[JsValue] = {
    val maybeJson = for {
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

  def getGroupedNewsletters(): Future[JsResult[GroupedNewsletters]] = {
    getBody("newsletters/grouped").map { json =>
      {
        json.validate[GroupedNewsletters]
      }
    }
  }

  def getNewsletters(): Future[JsResult[List[EmailNewsletter]]] = {
    getBody("newsletters").map { json =>
      {
        json.validate[List[EmailNewsletter]]
      }
    }
  }

}
