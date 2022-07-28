package services.newsletters

import common.{BadConfigurationException, GuLogging}
import conf.Configuration._
import play.api.libs.json.{JsError, JsSuccess, JsValue}
import play.api.libs.ws.WSClient
import services.newsletters.model.NewsletterResponse

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
    getBody("newsletters").map { json =>
      json.validate[List[NewsletterResponse]] match {
        case succ: JsSuccess[List[NewsletterResponse]] =>
          Right(succ.get)
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

  private def ensureHostSecure(host: String): String = host.replace("http:", "https:")

}
