package feed

import contentapi.DelegateHttp
import scala.concurrent.Await
import scala.concurrent.duration._
import play.api.libs.json._
import conf.Configuration._
import common.Logging

object OphanApi extends DelegateHttp with Logging {

  def getMostPopularReferredFromFacebook: Seq[String] = {

    def path(url: String) = url split "/" drop 3 mkString "/"

    val apiRequest = "%s/mostread?referrer=facebook&hours=3&api-key=%s" format(ophanApi.host, ophanApi.key)
    val paths = GET(apiRequest) map {
      response => {
        val json = Json.parse(response.body)
        val urls = (json \\ "url") map (_.as[String])
        urls map path
      }
    }

    for (e <- paths.failed) log error "Failed to get most popular referred from Facebook: " + e.getMessage

    Await.result(paths, 2.seconds)
  }
}
