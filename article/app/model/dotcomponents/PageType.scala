package model.dotcomponents

import common.Edition
import model.{ApplicationContext, PageWithStoryPackage}
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

  def apply(articlePage: PageWithStoryPackage, request: RequestHeader, context: ApplicationContext): PageType = {
    PageType(
      getMap(articlePage, Edition(request), false).getOrElse("hasShowcaseMainElement", JsBoolean(false)).as[Boolean],
      getMap(articlePage, Edition(request), false).getOrElse("isFront", JsBoolean(false)).as[Boolean],
      getMap(articlePage, Edition(request), false).getOrElse("isLiveBlog", JsBoolean(false)).as[Boolean],
      getMap(articlePage, Edition(request), false).getOrElse("isMinuteArticle", JsBoolean(false)).as[Boolean],
      getMap(articlePage, Edition(request), false).getOrElse("isPaidContent", JsBoolean(false)).as[Boolean],
      context.isPreview,
      getMap(articlePage, Edition(request), false).getOrElse("isSensitive", JsBoolean(false)).as[Boolean],
    )
  }
}
