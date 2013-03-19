package controllers

import play.api.mvc.{ Action, Controller }
import common.{ JsonComponent, Logging }
import play.api.libs.ws.WS
import java.net.URLEncoder.encode
import play.api.libs.concurrent.Promise.sequence
import model.Cached
import java.net.URI
import java.util.concurrent.TimeUnit.MILLISECONDS

private case class Social(count: Int)

object SocialCountController extends Controller with Logging {

  import conf.Configuration.google.googlePlusApiKey

  def render(url: String) = Action { implicit request =>
    val encodedUrl = encode(url, "UTF-8")

    val host = new URI(url).getHost

    // we are not proxying share counts for the entire internet
    if (!host.contains("guardian.co.uk") && !host.contains("guardiannews.com")) { Forbidden("Will only lookup Guardian pages") }
    else {
      val promiseOfTwitter = WS.url("http://urls.api.twitter.com/1/urls/count.json?url=%s".format(encodedUrl)).get()
        .map { response => socialOrBust("twitter") { Social((response.json \ "count").as[Int]) }
        }

      val promiseOfFacebook = WS.url("http://api.ak.facebook.com/restserver.php?v=1.0&method=links.getStats&urls=%s&format=json".format(encodedUrl)).get()
        .map { response => socialOrBust("facebook") { Social((response.json \\ "share_count")(0).as[Int]) }
        }

      val promiseOfReddit = WS.url("http://buttons.reddit.com/button_info.json?url=%s".format(encodedUrl)).get()
        .map { response => socialOrBust("reddit") { Social((response.json \\ "ups")(0).as[Int]) }
        }

      val promiseOflinkedIn = WS.url("http://www.linkedin.com/countserv/count/share?url=%s&format=json".format(encodedUrl)).get()
        .map { response => socialOrBust("linkedin") { Social((response.json \ "count").as[Int]) }
        }

      val promiseOfGooglePlus = googlePlusApiKey.map { key =>
        WS.url("https://clients6.google.com/rpc?key=" + key).withHeaders("Content-Type" -> "application/json").post {
          """
            |[
            | {
            |   "method":"pos.plusones.get",
            |   "id":"p",
            |   "params":{
            |     "nolog":true,
            |     "id":"%s",
            |     "source":"widget",
            |     "userId":"@viewer",
            |     "groupId":"@self"
            |   },
            |   "jsonrpc":"2.0",
            |   "key":"p",
            |   "apiVersion":"v1"
            | }
            |]
          """.stripMargin.format(url)
        }.map { response =>
          socialOrBust("googleplus") {
            Social(((response.json \\ "metadata")(0) \ "globalCounts" \ "count").as[Int])
          }
        }
      }.toSeq

      val countsWithTimeout =
        (Seq(promiseOfFacebook, promiseOfTwitter, promiseOfReddit, promiseOflinkedIn) ++ promiseOfGooglePlus)
          .map(_.orTimeout(None, 300, MILLISECONDS))

      Async {
        sequence(countsWithTimeout).map { _.map { _.left.getOrElse(None) } }
          .map { social =>
            Cached(900) {
              JsonComponent(social.flatten: _*)
            }
          }
      }
    }
  }

  //make sure we do not crash out entire call just because we cannot parse one result
  private def socialOrBust(name: String)(block: => Social): Option[(String, Social)] = try {
    Some(name -> block)
  } catch {
    case e: Throwable =>
      log.error("Error accessing " + name, e)
      None
  }
}
