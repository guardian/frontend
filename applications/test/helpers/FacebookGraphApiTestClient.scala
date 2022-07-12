package helpers

import java.io.File
import java.net.URLEncoder

import play.api.libs.ws.{WSClient, WSResponse}
import recorder.DefaultHttpRecorder
import services.FacebookGraphApiClient

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration.Duration

class FacebookGraphApiTestClient(wsClient: WSClient) extends FacebookGraphApiClient(wsClient) {

  val recorder = new DefaultHttpRecorder {
    override lazy val baseDir = new File(System.getProperty("user.dir"), "data/facebook-graph-api")
  }

  override def GET(endpoint: Option[String], timeout: Duration, params: (String, String)*)(implicit
      executionContext: ExecutionContext,
  ): Future[WSResponse] = {
    val queryString = params.map({ case (key, value) => key + "=" + URLEncoder.encode(value, "UTF-8") }).mkString("&")

    recorder.load(s"${makeUrl(endpoint)}?$queryString", Map.empty) {
      super.GET(endpoint, timeout, params: _*)
    }
  }
}
