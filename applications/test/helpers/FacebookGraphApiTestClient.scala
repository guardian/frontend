package helpers

import java.io.File
import java.net.URLEncoder

import play.api.libs.ws.WSClient
import recorder.DefaultHttpRecorder
import services.FacebookGraphApiClient


class FacebookGraphApiTestClient(wsClient: WSClient) extends FacebookGraphApiClient(wsClient) {

  val recorder = new DefaultHttpRecorder {
    override lazy val baseDir = new File(System.getProperty("user.dir"), "data/facebook-graph-api")
  }

  override def GET(endpoint: Option[String], params: (String, String)*) = {
    val queryString = params.map({ case (key, value) => key + "=" + URLEncoder.encode(value, "UTF-8")}).mkString("&")

    recorder.load(s"${makeUrl(endpoint)}?$queryString", Map.empty) {
      super.GET(endpoint, params: _*)
    }
  }
}
