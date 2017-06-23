package views.support

import com.gu.commercial.display.AdTargetParam.toMap
import common.Edition
import common.Maps.RichMap
import common.commercial.EditionAdTargeting._
import conf.Configuration.environment
import conf.{Configuration, DiscussionAsset}
import model._
import play.api.libs.json._
import play.api.mvc.RequestHeader

object JavaScriptPage {

  def get(page: Page)(implicit request: RequestHeader, context: ApplicationContext): JsValue = Json.toJson(getMap(page))

  def getMap(page: Page)(implicit request: RequestHeader, context: ApplicationContext): Map[String,JsValue] = {
    val edition = Edition(request)
    val metaData = page.metadata
    val content: Option[Content] = Page.getContent(page).map(_.content)

    val pageData = Configuration.javascript.pageData mapKeys { key =>
      CamelCase.fromHyphenated(key.split('.').lastOption.getOrElse(""))
    }

    val config = (Configuration.javascript.config ++ pageData).mapValues(JsString.apply)
    val sponsorshipType = for {
      commercial <- page.metadata.commercial
      branding <- commercial.branding(edition)
    } yield "sponsorshipType" -> JsString(branding.brandingType.name)
    val allowUserGeneratedContent = content.exists(_.allowUserGeneratedContent)
    val requiresMembershipAccess = content.exists(_.metadata.requiresMembershipAccess)
    val membershipAccess = content.flatMap(_.metadata.membershipAccess).getOrElse("")

    val cardStyle = content.map(_.cardStyle.toneString).getOrElse("")

    val commercialMetaData = Map(
      "dfpHost" -> JsString("pubads.g.doubleclick.net"),
      "hasPageSkin" -> JsBoolean(metaData.hasPageSkin(edition)),
      "shouldHideAdverts" -> JsBoolean(page match {
        case c: ContentPage if c.item.content.shouldHideAdverts => true
        case _: CommercialExpiryPage => true
        case _ => false
      }),
      "sharedAdTargeting" -> Json.toJson(toMap(metaData.commercial.map(_.adTargeting(edition)) getOrElse Set.empty))
    ) ++ sponsorshipType

    val javascriptConfig = page match {
      case c: ContentPage => c.getJavascriptConfig
      case s: StandalonePage => s.getJavascriptConfig
      case _ => Map()
    }

    javascriptConfig ++ config ++ commercialMetaData ++ Map(
      ("edition", JsString(edition.id)),
      ("ajaxUrl", JsString(Configuration.ajax.url)),
      ("isDev", JsBoolean(!environment.isProd)),
      ("isProd", JsBoolean(Configuration.environment.isProd)),
      ("idUrl", JsString(Configuration.id.url)),
      ("beaconUrl", JsString(Configuration.debug.beaconUrl)),
      ("assetsPath", JsString(Configuration.assets.path)),
      ("isPreview", JsBoolean(context.isPreview)),
      ("allowUserGeneratedContent", JsBoolean(allowUserGeneratedContent)),
      ("requiresMembershipAccess", JsBoolean(requiresMembershipAccess)),
      ("membershipAccess", JsString(membershipAccess)),
      ("idWebAppUrl", JsString(Configuration.id.oauthUrl)),
      ("cardStyle", JsString(cardStyle)),
      ("discussionFrontendUrl", JsString(DiscussionAsset("discussion-frontend.preact.iife")))
    )
  }
}
