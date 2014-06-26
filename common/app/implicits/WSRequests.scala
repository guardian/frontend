package implicits

import play.api.libs.ws.WS
import conf.Configuration
import com.ning.http.client.Realm.AuthScheme

object WSRequests {

  implicit class WsWithAuth(wsRequest: WS.WSRequestHolder) {
    def withPreviewAuth: WS.WSRequestHolder = Configuration.contentApi.previewAuth
      .foldLeft(wsRequest){ case (r, auth) => r.withAuth(auth.user, auth.password, AuthScheme.BASIC)}
  }

}