package dfp

import com.google.api.ads.admanager.axis.v202405._
import common.dfp._
import dfp.ApiHelper.{ toJodaTime, toSeq}

// These mapping functions use libraries that are only available in admin to create common DFP data models.
class DataMapper(
    customTargetingService: dfp.CustomTargetingService,
    customFieldService: dfp.CustomFieldService,
) {
    def toGuAdUnit(dfpAdUnit: AdUnit): GuAdUnit = {
    val ancestors = toSeq(dfpAdUnit.getParentPath)
    val ancestorNames = if (ancestors.isEmpty) Nil else ancestors.tail.map(_.getName)
    GuAdUnit(dfpAdUnit.getId, ancestorNames :+ dfpAdUnit.getName, dfpAdUnit.getStatus.getValue)
  }

  def toGuCreativeTemplate(dfpCreativeTemplate: CreativeTemplate): GuCreativeTemplate = {

    def toParameter(param: CreativeTemplateVariable) =
      GuCreativeTemplateParameter(
        parameterType = param.getClass.getSimpleName.stripSuffix("CreativeTemplateVariable"),
        label = param.getLabel,
        isRequired = param.getIsRequired,
        description = Option(param.getDescription),
      )

    GuCreativeTemplate(
      id = dfpCreativeTemplate.getId,
      name = dfpCreativeTemplate.getName,
      description = dfpCreativeTemplate.getDescription,
      parameters = Option(dfpCreativeTemplate.getVariables)
        .map { params =>
          (params map toParameter).toSeq
        }
        .getOrElse(Nil),
      snippet = dfpCreativeTemplate.getSnippet,
      creatives = Nil,
      isNative = dfpCreativeTemplate.getIsNativeEligible,
    )
  }

  def toGuTemplateCreative(dfpCreative: TemplateCreative): GuCreative = {

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

    GuCreative(
      id = dfpCreative.getId,
      name = dfpCreative.getName,
      lastModified = toJodaTime(dfpCreative.getLastModifiedDateTime),
      args = Option(dfpCreative.getCreativeTemplateVariableValues).map(_.map(arg)).map(_.toMap).getOrElse(Map.empty),
      templateId = Some(dfpCreative.getCreativeTemplateId),
      snippet = None,
      previewUrl = Some(dfpCreative.getPreviewUrl),
    )
  }
}

object DataMapper {
  def toGuCustomFieldOption(option: CustomFieldOption): GuCustomFieldOption =
    GuCustomFieldOption(option.getId, option.getDisplayName)

  def toGuCustomField(dfpCustomField: CustomField): GuCustomField = {
    val options: List[GuCustomFieldOption] = {
      dfpCustomField match {
        case dropdown: DropDownCustomField => dropdown.getOptions.toList
        case _                             => Nil
      }
    } map toGuCustomFieldOption

    GuCustomField(
      dfpCustomField.getId,
      dfpCustomField.getName,
      dfpCustomField.getDescription,
      dfpCustomField.getIsActive,
      dfpCustomField.getEntityType.getValue,
      dfpCustomField.getDataType.getValue,
      dfpCustomField.getVisibility.getValue,
      options,
    )
  }
}
