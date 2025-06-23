package views.support

import com.gu.commercial.display.AdTargetParam.toMap
import com.madgag.scala.collection.decorators.MapDecorator
import common.Edition
import common.Maps.RichMap
import common.commercial.EditionAdTargeting._
import conf.Configuration.environment
import conf.Configuration
import model._
import play.api.libs.json._
import model.IpsosTags.getScriptTag
import model.dotcomrendering.DotcomRenderingUtils.assetURL
import play.api.mvc.RequestHeader
import views.support.Commercial.isAdFree
import common.CommercialBundle
import experiments.{ActiveExperiments, CommercialPrebidTest}

object JavaScriptPage {

  def get(page: Page, edition: Edition, isPreview: Boolean, request: RequestHeader): JsValue =
    Json.toJson(getMap(page, edition, isPreview, request))

  def getMap(page: Page, edition: Edition, isPreview: Boolean, request: RequestHeader): Map[String, JsValue] = {
    val metaData = page.metadata
    val content: Option[Content] = Page.getContent(page).map(_.content)

    val pageData = Configuration.javascript.pageData mapKeys { key =>
      CamelCase.fromHyphenated(key.split('.').lastOption.getOrElse(""))
    }

    val config = (Configuration.javascript.config ++ pageData).mapV(JsString.apply)
    val sponsorshipType = for {
      commercial <- page.metadata.commercial
      branding <- commercial.branding(edition)
    } yield "sponsorshipType" -> JsString(branding.brandingType.name)
    val allowUserGeneratedContent = content.exists(_.allowUserGeneratedContent)
    val requiresMembershipAccess = content.exists(_.metadata.requiresMembershipAccess)
    val membershipAccess = content.flatMap(_.metadata.membershipAccess).getOrElse("")

    val cardStyle = content.map(_.cardStyle.toneString).getOrElse("")

    val nonRefreshableLineItemIds: JsArray = {
      val ids: Seq[Long] = metaData.commercial.map(_.nonRefreshableLineItemIds) getOrElse Nil
      JsArray(ids map (id => JsNumber(id)))
    }

    val commercialMetaData = Map(
      "dfpHost" -> JsString("pubads.g.doubleclick.net"),
      "hasPageSkin" -> JsBoolean(metaData.hasPageSkin(request)),
      "hasLiveBlogTopAd" -> JsBoolean(metaData.hasLiveBlogTopAd(request, content)),
      "hasSurveyAd" -> JsBoolean(metaData.hasSurveyAd(request)),
      "shouldHideAdverts" -> JsBoolean(page match {
        case c: ContentPage if c.item.content.shouldHideAdverts => true
        case _: CommercialExpiryPage                            => true
        case _                                                  => false
      }),
      "sharedAdTargeting" -> Json.toJson(toMap(metaData.commercial.map(_.adTargeting(edition)) getOrElse Set.empty)),
      "pbIndexSites" -> Json.toJson(metaData.commercial.flatMap(_.prebidIndexSites).getOrElse(Set.empty)),
      "isSensitive" -> JsBoolean(page.metadata.sensitive),
    ) ++ sponsorshipType

    val journalismMetaData = Map(
      "calloutsUrl" -> JsString(Configuration.journalism.calloutsUrl),
    )

    val javascriptConfig = page match {
      case c: ContentPage    => c.getJavascriptConfig
      case s: StandalonePage => s.getJavascriptConfig
      case _                 => Map()
    }

    val ipsos = if (page.metadata.isFront) getScriptTag(page.metadata.id) else getScriptTag(page.metadata.sectionId)

    val isInVariant = ActiveExperiments.isParticipating(CommercialPrebidTest)(request)

    val commercialBundleUrl = Configuration.commercial.overrideCommercialBundleUrl
      .getOrElse(CommercialBundle.bundleUrl(isInVariant))

    // val commercialBundleUrl = Configuration.commercial.overrideCommercialBundleUrl
    //   .getOrElse(CommercialBundle.bundleUrl)

    javascriptConfig ++ config ++ commercialMetaData ++ journalismMetaData ++ Map(
      ("edition", JsString(edition.id)),
      ("ajaxUrl", JsString(Configuration.ajax.url)),
      // TODO: decide whether the value for `isDev` should be
      // `environment.isDev` instead
      ("isDev", JsBoolean(!environment.isProd)),
      ("isProd", JsBoolean(Configuration.environment.isProd)),
      ("idUrl", JsString(Configuration.id.url)),
      ("mmaUrl", JsString(Configuration.id.mmaUrl)),
      ("beaconUrl", JsString(Configuration.debug.beaconUrl)),
      ("assetsPath", JsString(Configuration.assets.path)),
      ("isPreview", JsBoolean(isPreview)),
      ("allowUserGeneratedContent", JsBoolean(allowUserGeneratedContent)),
      ("requiresMembershipAccess", JsBoolean(requiresMembershipAccess)),
      ("membershipAccess", JsString(membershipAccess)),
      ("idWebAppUrl", JsString(Configuration.id.oauthUrl)),
      ("cardStyle", JsString(cardStyle)),
      ("brazeApiKey", JsString(Configuration.braze.apiKey)),
      ("ipsosTag", JsString(ipsos)),
      ("isAdFree", JsBoolean(isAdFree(request))),
      ("commercialBundleUrl", JsString(commercialBundleUrl)),
      ("stage", JsString(Configuration.environment.stage)),
    )
  }.toMap
}
