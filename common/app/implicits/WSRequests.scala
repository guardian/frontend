package implicits

import common.HttpStatusException
import conf.Configuration
import play.api.libs.ws.{WSAuthScheme, WSRequestHolder, WSResponse}

import scala.concurrent.{ExecutionContext, Future}

trait WSRequests {

  implicit class RichWSRequestHolder(wsRequest: WSRequestHolder) {

    def getOKResponse()(implicit ec: ExecutionContext): Future[WSResponse] = {
      wsRequest.get() flatMap { response =>
        response.status match {
          case 200 => Future.successful(response)
          case _ => Future.failed(HttpStatusException(response.status, response.statusText))
        }
      }
    }

    def withPreviewAuth: WSRequestHolder = Configuration.contentApi.previewAuth
      .foldLeft(wsRequest){ case (r, auth) => r.withAuth(auth.user, auth.password, WSAuthScheme.BASIC)}
  }
}
