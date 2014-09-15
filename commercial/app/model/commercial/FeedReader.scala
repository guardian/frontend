package model.commercial

import com.ning.http.client.{Response => AHCResponse}
import common.ExecutionContexts
import conf.Switch
import play.api.Play.current
import play.api.libs.ws.WS

import scala.concurrent.Future
import scala.concurrent.duration.{Duration, _}

object FeedReader extends ExecutionContexts {

  def read[T](request: FeedRequest)(parse: String => T): Future[Either[FeedReadFailure, T]] = {
    if (request.switch.isSwitchedOn) {
      val futureResponse = WS.url(request.url)
        .withRequestTimeout(request.timeout.toMillis.toInt)
        .get()
      futureResponse map { response =>
        response.status match {
          case 200 =>
            val body = request.responseEncoding map {
              response.underlying[AHCResponse].getResponseBody
            } getOrElse {
              response.body
            }
            Right(parse(body))
          case other =>
            Left(FeedReadException(s"Response status $other: ${response.statusText}"))
        }
      } recover {
        case e: Exception =>
          Left(FeedReadException(e.getMessage))
      }
    } else {
      Future.successful(Left(FeedReadWarning("Switch is off")))
    }
  }

}


case class FeedRequest(switch: Switch, url: String, timeout: Duration = 2.seconds, responseEncoding: Option[String] = None)


trait FeedReadFailure {val message: String}

case class FeedReadWarning(message: String) extends FeedReadFailure

case class FeedReadException(message: String) extends FeedReadFailure
