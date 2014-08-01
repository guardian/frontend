package implicits

import conf.Configuration
import play.api.libs.ws.{WSAuthScheme, WSRequestHolder}

object WSRequests {

  implicit class WsWithAuth(wsRequest: WSRequestHolder) {
    def withPreviewAuth: WSRequestHolder = Configuration.contentApi.previewAuth
      .foldLeft(wsRequest){ case (r, auth) => r.withAuth(auth.user, auth.password, WSAuthScheme.BASIC)}
  }

}