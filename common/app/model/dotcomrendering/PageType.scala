package model.dotcomrendering

import common.Edition
import model.{ApplicationContext, Page}
import play.api.libs.json.{JsBoolean, Json, OWrites}
import play.api.mvc.RequestHeader
import views.support.JavaScriptPage.getMap

case class PageType(
    hasShowcaseMainElement: Boolean,
    isFront: Boolean,
    isLiveblog: Boolean,
    isMinuteArticle: Boolean,
    isPaidContent: Boolean,
    isPreview: Boolean,
    isSensitive: Boolean,
)

object PageType {
  implicit val writes: OWrites[PageType] = Json.writes[PageType]

  def apply(page: Page, request: RequestHeader, context: ApplicationContext): PageType = {
    val config = getMap(page, Edition(request), false, request) // Only construct config once

    def configFor(key: String): Boolean = config.getOrElse(key, JsBoolean(false)).as[Boolean]

    PageType(
      hasShowcaseMainElement = configFor("hasShowcaseMainElement"),
      isFront = configFor("isFront"),
      isLiveblog = configFor("isLiveBlog"),
      isMinuteArticle = configFor("isMinuteArticle"),
      isPaidContent = configFor("isPaidContent"),
      isPreview = context.isPreview,
      isSensitive = configFor("isSensitive"),
    )
  }
}
