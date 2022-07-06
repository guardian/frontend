package implicits

import common.HttpStatusException
import play.api.libs.ws.{WSRequest, WSResponse}

import scala.concurrent.{ExecutionContext, Future}

trait WSRequests {

  implicit class RichWSRequest(wsRequest: WSRequest) {

    def getOKResponse()(implicit ec: ExecutionContext): Future[WSResponse] = {
      wsRequest.get() flatMap { response =>
        response.status match {
          case 200 => Future.successful(response)
          case _   => Future.failed(HttpStatusException(response.status, response.statusText))
        }
      }
    }
  }
}
