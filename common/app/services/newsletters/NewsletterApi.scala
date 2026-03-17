package services.newsletters

import common.{BadConfigurationException, GuLogging}
import conf.Configuration._
import play.api.libs.json.{JsError, JsSuccess, JsValue}
import play.api.libs.ws.WSClient
import services.newsletters.model.{
  NewsletterResponse,
  NewsletterResponseV2,
  NewslettersGetResponseV2Body,
  NewsletterLayoutsResponseBody,
  NewsletterLayout,
}

import scala.concurrent.duration.DurationInt
import scala.concurrent.{ExecutionContext, Future}

object GroupedNewslettersResponse {
  type GroupedNewslettersResponse = List[(String, List[NewsletterResponse])]
}
object GroupedNewsletterResponse {
  type GroupedNewsletterResponse = (String, List[NewsletterResponse])
}

case class NewsletterApi(wsClient: WSClient)(implicit executionContext: ExecutionContext)
    extends GuLogging
    with implicits.WSRequests {

  def getNewsletters(): Future[Either[String, List[NewsletterResponse]]] = {
    getBody("api/legacy/newsletters").map { json =>
      json.validate[List[NewsletterResponse]] match {
        case succ: JsSuccess[List[NewsletterResponse]] =>
          Right(succ.get)
        case err: JsError => Left(err.toString)
      }
    }
  }

  def getV2Newsletters(): Future[Either[String, List[NewsletterResponseV2]]] = {
    getBody("api/newsletters").map { json =>
      json.validate[NewslettersGetResponseV2Body] match {
        case succ: JsSuccess[NewslettersGetResponseV2Body] =>
          Right(succ.get.data)
        case err: JsError => Left(err.toString)
      }
    }
  }

  def getNewsletterLayouts(): Future[Either[String, Map[String, NewsletterLayout]]] = {
    getBody("api/layouts").map { json =>
      json.validate[NewsletterLayoutsResponseBody] match {
        case succ: JsSuccess[NewsletterLayoutsResponseBody] =>
          Right(succ.get.data)
        case err: JsError => Left(err.toString)
      }
    }
  }

  private def getBody(path: String): Future[JsValue] = {
    val maybeJson: Option[Future[JsValue]] = for {
      host <- newsletterApi.host
      origin <- newsletterApi.origin
    } yield {
      val url = s"${ensureHostSecure(host)}/$path"
      log.debug(s"Making request to newsletters API: $url")
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

  private def ensureHostSecure(host: String): String = host.replace("http:", "https:")

}
