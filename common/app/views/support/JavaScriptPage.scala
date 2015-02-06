package views.support

import common.Edition
import common.Maps.RichMap
import conf.Configuration
import conf.Configuration.environment
import model.{Content, MetaData}
import org.joda.time.DateTime
import play.api.Play
import play.api.Play.current
import play.api.libs.json.{JsBoolean, JsString, Json}
import play.api.mvc.RequestHeader

case class JavaScriptPage(metaData: MetaData)(implicit request: RequestHeader) {

  def get = {
    val edition = Edition(request)

    val pageData = Configuration.javascript.pageData mapKeys { key =>
      CamelCase.fromHyphenated(key.split('.').lastOption.getOrElse(""))
    }

    val config = (Configuration.javascript.config ++ pageData).mapValues(JsString.apply)

    Json.toJson(metaData.metaData ++ config ++ Map(
      ("edition", JsString(edition.id)),
      ("ajaxUrl", JsString(Configuration.ajax.url)),
      ("isDev", JsBoolean(Play.isDev)),
      ("oasHost", JsString("oas.theguardian.com")),
      ("oasUrl", JsString(Configuration.oas.url)),
      ("oasSiteIdHost", JsString("www.theguardian-alpha.com")),
      ("dfpHost", JsString("pubads.g.doubleclick.net")),
      ("idUrl", JsString(Configuration.id.url)),
      ("beaconUrl", JsString(Configuration.debug.beaconUrl)),
      ("renderTime", JsString(DateTime.now.toISODateTimeNoMillisString)),
      ("isSSL", JsBoolean(Configuration.environment.secure)),
      ("assetsPath", JsString(Configuration.assets.path)),
      ("hasPageSkin", JsBoolean(metaData.hasPageSkin(edition))),
      ("shouldHideAdverts", JsBoolean(metaData match {
        case c: Content if c.shouldHideAdverts => true
        case _ => false
      })),
      ("isPreview", JsBoolean(environment.isPreview)),
      ("isInappropriateForSponsorship", JsBoolean(metaData.isInappropriateForSponsorship))
    ) ++ metaData.sponsorshipType.map{s => Map("sponsorshipType" -> JsString(s))}.getOrElse(Nil)
      ++ metaData.sponsorshipTag.map{tag => Map("sponsorshipTag" -> JsString(tag.name))}.getOrElse(Nil))
  }

}
