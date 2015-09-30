package views.support

import common.Maps.RichMap
import common.{StaticPage, Edition, InternationalEdition}
import conf.Configuration
import conf.Configuration.environment
import conf.switches.Switches.IdentitySocialOAuthSwitch
import model.{CommercialExpiryPage, Content, MetaData}
import org.joda.time.DateTime
import play.api.Play
import play.api.Play.current
import play.api.libs.json.{JsBoolean, JsString, Json}
import play.api.mvc.RequestHeader

case class JavaScriptPage(metaData: MetaData)(implicit request: RequestHeader) {

  def get = {
    val edition = Edition(request)
    val internationalEdition = InternationalEdition(request) map { edition =>
      ("internationalEdition", JsString(edition.variant))
    }

    val pageData = Configuration.javascript.pageData mapKeys { key =>
      CamelCase.fromHyphenated(key.split('.').lastOption.getOrElse(""))
    }

    val config = (Configuration.javascript.config ++ pageData).mapValues(JsString.apply)

    Json.toJson(metaData.metaData ++ config ++ internationalEdition ++ Map(
      ("edition", JsString(edition.id)),
      ("ajaxUrl", JsString(Configuration.ajax.url)),
      ("isDev", JsBoolean(Play.isDev)),
      ("isProd", JsBoolean(Configuration.environment.isProd)),
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
      ("hasBelowTopNavSlot", JsBoolean(metaData.hasAdInBelowTopNavSlot(edition))),
      ("omitMPUs", JsBoolean(metaData.omitMPUsFromContainers(edition))),
      ("shouldHideAdverts", JsBoolean(metaData match {
        case c: Content if c.shouldHideAdverts => true
        case p: StaticPage => true
        case CommercialExpiryPage(_) => true
        case _ => false
      })),
      ("isPreview", JsBoolean(environment.isPreview)),
      ("allowUserGeneratedContent", JsBoolean(metaData match {
        case c: Content if c.allowUserGeneratedContent => true
        case _ => false
      })),
      ("isInappropriateForSponsorship", JsBoolean(metaData.isInappropriateForSponsorship)),
      ("idWebAppUrl", JsString(
        if (IdentitySocialOAuthSwitch.isSwitchedOn) Configuration.id.oauthUrl
        else Configuration.id.webappUrl
      )),
      ("pushNotificationsHost", JsString(Configuration.pushNotifications.host))
    ) ++ metaData.sponsorshipType.map{s => Map("sponsorshipType" -> JsString(s))}.getOrElse(Nil)
      ++ metaData.sponsorshipTag.map{tag => Map("sponsorshipTag" -> JsString(tag.name))}.getOrElse(Nil))
  }

}
