package model.dotcomponents

import model.PageWithStoryPackage
import play.api.libs.json.Json
import play.api.mvc.RequestHeader
import views.support.JavaScriptPage

case class CommercialConfiguration(
  hasShowcaseMainElement: Boolean,
  isFront: Boolean,
  isLiveblog: Boolean,
  isMinuteArticle: Boolean,
  isPaidContent: Boolean,
  isPreview: Boolean,
  isSensitive: Boolean
)

object CommercialConfiguration {
  implicit val writes = Json.writes[CommercialConfiguration]
}

object DotcomponentsCommercialHelper {



  def makeCommercialConfiguration(articlePage: PageWithStoryPackage, request: RequestHeader, context: model.ApplicationContext): CommercialConfiguration = {
    val dcrJavaScriptPageConfigurationFragment = JavaScriptPage.commercialConfigurationFragmentForDotcomRendering(articlePage, request)
    CommercialConfiguration(
      dcrJavaScriptPageConfigurationFragment.hasShowcaseMainElement,
      dcrJavaScriptPageConfigurationFragment.isFront,
      dcrJavaScriptPageConfigurationFragment.isLiveblog,
      dcrJavaScriptPageConfigurationFragment.isMinuteArticle,
      dcrJavaScriptPageConfigurationFragment.isPaidContent,
      context.isPreview,
      dcrJavaScriptPageConfigurationFragment.isSensitive
    )
  }
}

