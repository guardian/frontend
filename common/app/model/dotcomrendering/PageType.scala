package model.dotcomrendering

import common.Edition
import model.{ApplicationContext, Page}
import play.api.libs.json.{JsBoolean, Json}
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
  implicit val writes = Json.writes[PageType]

  def apply(page: Page, request: RequestHeader, context: ApplicationContext): PageType = {
    PageType(
      getMap(page, Edition(request), false, request)
        .getOrElse("hasShowcaseMainElement", JsBoolean(false))
        .as[Boolean],
      getMap(page, Edition(request), false, request).getOrElse("isFront", JsBoolean(false)).as[Boolean],
      getMap(page, Edition(request), false, request).getOrElse("isLiveBlog", JsBoolean(false)).as[Boolean],
      getMap(page, Edition(request), false, request).getOrElse("isMinuteArticle", JsBoolean(false)).as[Boolean],
      getMap(page, Edition(request), false, request).getOrElse("isPaidContent", JsBoolean(false)).as[Boolean],
      context.isPreview,
      getMap(page, Edition(request), false, request).getOrElse("isSensitive", JsBoolean(false)).as[Boolean],
    )
  }
}
