package commercial

import java.lang.System.currentTimeMillis
import java.util.concurrent.TimeoutException

import com.ning.http.client.Response
import conf.switches.Switch
import play.api.Play.current
import play.api.libs.ws.{WS, WSResponse}

import scala.concurrent.duration.{Duration, _}
import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal

class FeedFetcher(
  val feedName: String,
  val url: String,
  val parameters: Map[String, String],
  val timeout: Duration,
  val switch: Switch,
  responseEncoding: String = DefaultResponseEncoding()
) {

  def fetch()(implicit executionContext: ExecutionContext): Future[FetchResponse] = {

    def body(response: WSResponse): String = {
      if (responseEncoding == DefaultResponseEncoding()) {
        response.body
      } else {
        response.underlying[Response].getResponseBody(responseEncoding)
      }
    }

    def contentType(response: WSResponse): String = {
      response.underlying[Response].getContentType
    }

    switch.onInitialized flatMap { _ =>
      if (switch.isSwitchedOn) {

        val start = currentTimeMillis()
        val futureResponse = WS.url(url)
                             .withQueryString(parameters.toSeq: _*)
                             .withRequestTimeout(timeout.toMillis.toInt)
                             .get()

        futureResponse map { response =>
          if (response.status == 200) {
            FetchResponse(
              Feed(body(response), contentType(response)),
              Duration(currentTimeMillis() - start, MILLISECONDS)
            )
          } else {
            throw FetchFailure(Some(response.status), response.statusText)
          }
        } recoverWith {
          case e: TimeoutException => Future.failed(FetchTimeout)
          case NonFatal(e) => Future.failed(FetchFailure(None, e.getMessage))
        }
      } else Future.failed(FetchSwitchedOff)
    }
  }
}

object DefaultResponseEncoding {

  def apply(): String = "ISO-8859-1"
}

case class FetchResponse(feed: Feed, duration: Duration)
case class Feed(content: String, contentType: String)

sealed trait FetchException extends Exception
final case class FetchFailure(status: Option[Int], message: String) extends FetchException
case object FetchTimeout extends FetchException
case object FetchSwitchedOff extends FetchException
