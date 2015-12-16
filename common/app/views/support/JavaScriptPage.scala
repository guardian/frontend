package views.support

import common.Maps.RichMap
import common.{Edition, InternationalEdition}
import conf.Configuration
import conf.Configuration.environment
import model._
import org.joda.time.DateTime
import play.api.Play
import play.api.Play.current
import play.api.libs.json.{JsValue, JsBoolean, JsString, Json}
import play.api.mvc.RequestHeader

object JavaScriptPage {

  def get(page: Page)(implicit request: RequestHeader): JsValue = Json.toJson(getMap(page))

  def getMap(page: Page)(implicit request: RequestHeader): Map[String,JsValue] = {
    val edition = Edition(request)
    val metaData = page.metadata
    val content: Option[Content] = Page.getContent(page).map(_.content)

    // keeping this here for now as we use it for the "opt in" message
    val internationalEdition = InternationalEdition(request) map { edition =>
      ("internationalEdition", JsString(edition))
    }

    val pageData = Configuration.javascript.pageData mapKeys { key =>
      CamelCase.fromHyphenated(key.split('.').lastOption.getOrElse(""))
    }

    val config = (Configuration.javascript.config ++ pageData).mapValues(JsString.apply)
    val isInappropriateForSponsorship = content.exists(_.commercial.isInappropriateForSponsorship)
    val sponsorshipType = content.flatMap(_.commercial.sponsorshipType).map("sponsorshipType" -> JsString(_))
    val sponsorshipTag = content.flatMap(_.commercial.sponsorshipTag).map( tag => "sponsorshipTag" -> JsString(tag.name))
    val allowUserGeneratedContent = content.map(_.allowUserGeneratedContent).getOrElse(false)
    val requiresMembershipAccess = content.map(_.metadata.requiresMembershipAccess).getOrElse(false)
    val membershipAccess = content.flatMap(_.metadata.membershipAccess).getOrElse("")

    val commercialMetaData = Map(
      "oasHost" -> JsString("oas.theguardian.com"),
      "oasUrl" -> JsString(Configuration.oas.url),
      "oasSiteIdHost" -> JsString("www.theguardian-alpha.com"),
      "dfpHost" -> JsString("pubads.g.doubleclick.net"),
      "hasPageSkin" -> JsBoolean(metaData.hasPageSkin(edition)),
      "hasBelowTopNavSlot" -> JsBoolean(metaData.hasAdInBelowTopNavSlot(edition)),
      "shouldHideAdverts" -> JsBoolean(page match {
        case c: ContentPage if c.item.content.shouldHideAdverts => true
        case c: CommercialExpiryPage => true
        case _ => false
      }),
      "isInappropriateForSponsorship" -> JsBoolean(isInappropriateForSponsorship)
    ) ++ sponsorshipType ++ sponsorshipTag

    val javascriptConfig = page match {
      case c: ContentPage => c.getJavascriptConfig
      case s: StandalonePage => s.getJavascriptConfig
      case _ => Map()
    }

    javascriptConfig ++ config ++ internationalEdition ++ commercialMetaData ++ Map(
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
      ("allowUserGeneratedContent", JsBoolean(allowUserGeneratedContent)),
      ("requiresMembershipAccess", JsBoolean(requiresMembershipAccess)),
      ("membershipAccess", JsString(membershipAccess)),
      ("idWebAppUrl", JsString(Configuration.id.oauthUrl))
    )
  }
}