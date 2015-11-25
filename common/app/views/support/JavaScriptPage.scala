package views.support

import common.Maps.RichMap
import common.{Edition, InternationalEdition}
import conf.Configuration
import conf.Configuration.environment
import model.{CommercialExpiryPage, Content, MetaData}
import org.joda.time.DateTime
import play.api.Play
import play.api.Play.current
import play.api.libs.json.{JsBoolean, JsString, Json}
import play.api.mvc.RequestHeader

case class JavaScriptPage(metaData: MetaData)(implicit request: RequestHeader) {

  def get = {
    val edition = Edition(request)

    // keeping this here for now as we use it for the "opt in" message
    val internationalEdition = InternationalEdition(request) map { edition =>
      ("internationalEdition", JsString(edition))
    }

    val pageData = Configuration.javascript.pageData mapKeys { key =>
      CamelCase.fromHyphenated(key.split('.').lastOption.getOrElse(""))
    }

    val config = (Configuration.javascript.config ++ pageData).mapValues(JsString.apply)

    val commercialMetaData = Map(
      "oasHost" -> JsString("oas.theguardian.com"),
      "oasUrl" -> JsString(Configuration.oas.url),
      "oasSiteIdHost" -> JsString("www.theguardian-alpha.com"),
      "dfpHost" -> JsString("pubads.g.doubleclick.net"),
      "hasPageSkin" -> JsBoolean(metaData.hasPageSkin(edition)),
      "hasBelowTopNavSlot" -> JsBoolean(metaData.hasAdInBelowTopNavSlot(edition)),
      "shouldHideAdverts" -> JsBoolean(metaData match {
        case c: Content if c.shouldHideAdverts => true
        case CommercialExpiryPage(_) => true
        case _ => false
      }),
      "isInappropriateForSponsorship" -> JsBoolean(metaData.isInappropriateForSponsorship)
    ) ++ metaData.sponsorshipType.map { sponsorshipType =>
      Map("sponsorshipType" -> JsString(sponsorshipType))
    }.getOrElse(Nil) ++
      metaData.sponsorshipTag.map { tag =>
        Map("sponsorshipTag" -> JsString(tag.name))
      }.getOrElse(Nil)

    Json.toJson(metaData.metaData ++ config ++ internationalEdition ++ commercialMetaData ++ Map(
      ("edition", JsString(edition.id)),
      ("ajaxUrl", JsString(Configuration.ajax.url)),
      ("isDev", JsBoolean(Play.isDev)),
      ("isProd", JsBoolean(Configuration.environment.isProd)),
      ("idUrl", JsString(Configuration.id.url)),
      ("beaconUrl", JsString(Configuration.debug.beaconUrl)),
      ("renderTime", JsString(DateTime.now.toISODateTimeNoMillisString)),
      ("isSSL", JsBoolean(Configuration.environment.secure)),
      ("assetsPath", JsString(Configuration.assets.path)),
      ("isPreview", JsBoolean(environment.isPreview)),
      ("allowUserGeneratedContent", JsBoolean(metaData match {
        case c: Content if c.allowUserGeneratedContent => true
        case _ => false
      })),
      ("idWebAppUrl", JsString(Configuration.id.oauthUrl))
    ))
  }

}
