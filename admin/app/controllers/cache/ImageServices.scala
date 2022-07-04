package controllers.cache

import java.net.URI

import conf.AdminConfiguration.fastly
import conf.Configuration.environment.stage
import play.api.libs.ws.WSClient

object ImageServices {

  // none of the stuff here is a state secret.
  // it is all authenticated

  private val iGuimCoUk = "1L0HRheo6sMtfQHnY1FU6C"
  private val iGuimCodeCoUk = "5CSDV7WcKwnIIHipZzt3po"

  private val fastlyIOService = if (stage == "PROD") iGuimCoUk else iGuimCodeCoUk

  private val fastlyOriginCdns = Map(
    "static.guim.co.uk" -> "5qHts5Ev0rFxzm1DhCkmyA",
    "media.guim.co.uk" -> "1NLDlK1ywahkZzRZrmWIYw",
    "uploads.guim.co.uk" -> "2TmfkSoyUoNo8aFNe6Htjs",
    "sport.guim.co.uk" -> "1C2vPr3E26cRb4NXa0wMf3",
  )

  // clear both the origin CDN and Fastly IO service (either i.guim.co.uk or i.guimcode.co.uk)
  private def fastlyServiceIdsforOrigin(host: String): Seq[String] = Seq(fastlyOriginCdns(host), fastlyIOService)

  def clearFastly(originUri: URI, wsClient: WSClient): Unit = {
    fastlyServiceIdsforOrigin(originUri.getHost).foreach { serviceId =>
      // This works because the "path" is set as a Surrogate Key for images in i.guim.co.uk
      // https://www.fastly.com/blog/surrogate-keys-part-1/
      wsClient
        .url(s"https://api.fastly.com/service/$serviceId/purge/${originUri.getPath}")
        .withHttpHeaders("Fastly-Key" -> fastly.key)
        .post("")
    }
  }

}
