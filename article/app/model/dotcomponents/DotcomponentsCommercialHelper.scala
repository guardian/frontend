package model.dotcomponents

import model.{PageWithStoryPackage, DCRContextCommercialConfigurationFragment}
import play.api.libs.json.Json
import play.api.mvc.RequestHeader
import views.support.{JavaScriptPage, DCRJavaScriptPageCommercialConfigurationFragment}

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

  def makeCommercialConfiguration(javaScriptPageConfigurationFragment: DCRJavaScriptPageCommercialConfigurationFragment, contextConfigurationFragment: DCRContextCommercialConfigurationFragment): CommercialConfiguration = {
    CommercialConfiguration(
      javaScriptPageConfigurationFragment.hasShowcaseMainElement,
      javaScriptPageConfigurationFragment.isFront,
      javaScriptPageConfigurationFragment.isLiveblog,
      javaScriptPageConfigurationFragment.isMinuteArticle,
      javaScriptPageConfigurationFragment.isPaidContent,
      contextConfigurationFragment.isPreview,
      javaScriptPageConfigurationFragment.isSensitive
    )
  }
}

