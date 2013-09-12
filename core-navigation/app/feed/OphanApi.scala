package feed

import contentapi.DelegateHttp
import scala.concurrent.Await
import scala.concurrent.duration._
import play.api.libs.json._
import conf.Configuration._

object OphanApi extends DelegateHttp {

  def getMostPopularReferredFromFacebook: Seq[String] = {

    //TODO: exception
    val paths = GET("http://%s/api/mostread?referrer=facebook&hours=3&api-key=%s" format(ophanApi.host, ophanApi.key)) map {
      response => {
        val json = Json.parse(response.body)
        val urls = (json \\ "url") map (_.as[String])
        //TODO: do this better?
        urls map (url => url.stripPrefix("http://www.theguardian.com/"))
      }
    }

    Await.result(paths, 2.seconds)
  }
}
