package helpers

import java.io.File
import java.net.URLEncoder

import play.api.libs.ws.{WSClient, WSResponse}
import recorder.DefaultHttpRecorder
import services.FacebookGraphApiClient


class FacebookGraphApiTestClient(wsClient: WSClient) extends FacebookGraphApiClient(wsClient) {

  val recorder = new DefaultHttpRecorder {
    override lazy val baseDir = new File(System.getProperty("user.dir"), "data/facebook-graph-api")
  }

  override def GET[T](endpoint: Option[String], params: (String, String)*)(asResult: WSResponse => T) = {
    val augmentedParams = addAccessToken(params)
    val queryString = augmentedParams.map({ case (key, value) => key + "=" + URLEncoder.encode(value, "UTF-8")}).mkString("&")

    recorder.load(s"${makeUrl(endpoint)}?$queryString", Map.empty) {
      super.GET[WSResponse](endpoint, params: _*)(r => r)
    } map asResult
  }
}
