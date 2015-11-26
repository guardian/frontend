package dfp

import com.google.api.ads.dfp.axis.v201508._
import common.dfp.{GuCreative, GuCreativeTemplate, GuCreativeTemplateParameter}
import dfp.ApiHelper.toJodaTime

object DataMapper {

  def toGuCreativeTemplate(dfpCreativeTemplate: CreativeTemplate) = {

    def toParameter(param: CreativeTemplateVariable) = GuCreativeTemplateParameter(
      parameterType = param.getClass.getSimpleName.stripSuffix("CreativeTemplateVariable"),
      label = param.getLabel,
      isRequired = param.getIsRequired,
      description = Option(param.getDescription)
    )

    GuCreativeTemplate(
      id = dfpCreativeTemplate.getId,
      name = dfpCreativeTemplate.getName,
      description = dfpCreativeTemplate.getDescription,
      parameters = Option(dfpCreativeTemplate.getVariables).map { params =>
        (params map toParameter).toSeq
      }.getOrElse(Nil),
      snippet = dfpCreativeTemplate.getSnippet,
      creatives = Nil
    )
  }

  def toGuCreative(dfpCreative: Creative) = GuCreative(
    id = dfpCreative.getId,
    name = dfpCreative.getName,
    lastModified = toJodaTime(dfpCreative.getLastModifiedDateTime),
    args = Map.empty,
    templateId = None,
    snippet = None
  )

  def toGuTemplateCreative(dfpCreative: TemplateCreative) = {

    def arg(variableValue: BaseCreativeTemplateVariableValue): (String, String) = {
      val exampleAssetUrl =
        "https://tpc.googlesyndication.com/pagead/imgad?id=CICAgKCT8L-fJRABGAEyCCXl5VJTW9F8"
      val argValue = variableValue match {
        case s: StringCreativeTemplateVariableValue =>
          Option(s.getValue) getOrElse ""
        case u: UrlCreativeTemplateVariableValue =>
          Option(u.getValue) getOrElse ""
        case _: AssetCreativeTemplateVariableValue =>
          exampleAssetUrl
        case other => "???"
      }
      variableValue.getUniqueName -> argValue
    }

    toGuCreative(dfpCreative).copy(
      args = Option(dfpCreative.getCreativeTemplateVariableValues).map(_.map(arg)).map(_.toMap).getOrElse(Map.empty),
      templateId = Some(dfpCreative.getCreativeTemplateId)
    )
  }

  def toGuThirdPartyCreative(dfpCreative: ThirdPartyCreative) = {
    toGuCreative(dfpCreative).copy(snippet = Some(dfpCreative.getSnippet))
  }
}
