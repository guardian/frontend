package controllers.cache

import java.net.URI

import common.ExecutionContexts
import conf.AdminConfiguration.{fastly, imgix}
import play.api.libs.json.{JsObject, JsString}
import play.api.libs.ws.{WS, WSAuthScheme}
import play.api.Play.current
import views.support.ImgSrc.tokenFor
import views.support.ImageUrlSigner.sign

object ImageServices extends ExecutionContexts {

  // none of the stuff here is a state secret.
  // it is all authenticated

  private val iGuimCoUk = "YjEge7vUbdglYXtZ56cU1"

  private val fastlyOriginCdns = Map(
    "static.guim.co.uk" -> "5qHts5Ev0rFxzm1DhCkmyA",
    "media.guim.co.uk" -> "1NLDlK1ywahkZzRZrmWIYw"
  )

  // clear both the origin CDN and i.guim.co.uk
  private def fastlyServiceIdsforOrigin(host: String): Seq[String] = Seq(fastlyOriginCdns(host), iGuimCoUk)


  private val imgixBackends = Map(
    "static.guim.co.uk" -> "static-guim.imgix.net",
    "media.guim.co.uk" -> "media-guim.imgix.net"
  )
  private def imgixBackendFor(host: String): String = imgixBackends(host)

  def clearImgix(originUri: URI) {
    val host = originUri.getHost
    val imgixHost = imgixBackendFor(host)
    val http = originUri.getScheme
    val originalPath = originUri.getPath
    val path = tokenFor(host).map(sign(originalPath, _)).getOrElse(originalPath)

    val url = s"$http://$imgixHost$path"
    val bodyJson = JsObject(Seq("url" -> JsString(url)))

    WS.url("https://api.imgix.com/v2/image/purger")
      // yeah, they just use the first part of basic auth
      .withAuth(imgix.key, "", WSAuthScheme.BASIC)
      .post(bodyJson)
  }

  def clearFastly(originUri: URI) {
    fastlyServiceIdsforOrigin(originUri.getHost).foreach { serviceId =>
      // This works because the "path" is set as a Surrogate Key for images in i.guim.co.uk
      // https://www.fastly.com/blog/surrogate-keys-part-1/
      WS.url(s"https://api.fastly.com/service/$serviceId/purge/${originUri.getPath}")
        .withHeaders("Fastly-Key" -> fastly.key)
        .post("")
    }
  }

}
