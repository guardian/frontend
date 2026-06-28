package model.dotcomrendering

import model.dotcomrendering.DotcomRenderingUtils.withoutNull
import navigation.Nav
import play.api.libs.json.{JsObject, JsValue, Json}

case class DotcomRenderingShellDataModel(
    canonicalUrl: String,
    config: JsObject,
    contributionsServiceUrl: String,
    editionId: String,
    guardianBaseURL: String,
    isAdFreeUser: Boolean,
    nav: Nav,
    pageFooter: PageFooter,
    pageId: String,
) {
  def toJson: JsValue = {
    Json.toJson(
      withoutNull(
        Json.obj(
          "canonicalUrl" -> canonicalUrl,
          "config" -> config,
          "contributionsServiceUrl" -> contributionsServiceUrl,
          "editionId" -> editionId,
          "guardianBaseURL" -> guardianBaseURL,
          "isAdFreeUser" -> isAdFreeUser,
          "nav" -> Json.toJson(nav),
          "pageFooter" -> Json.toJson(pageFooter),
          "pageId" -> pageId,
        ),
      ),
    )
  }
}
