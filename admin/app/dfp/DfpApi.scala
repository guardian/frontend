package dfp

import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder
import com.google.api.ads.dfp.axis.v201508._
import common.dfp.{GuCreative, GuCreativeTemplate, GuCreativeTemplateParameter}
import dfp.ApiHelper.toJodaTime
import org.joda.time.DateTime

// this is replacing DfpDataHydrator
object DfpApi {

  def loadActiveCreativeTemplates(): Seq[GuCreativeTemplate] = {

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

    val templates = for (session <- SessionWrapper()) yield {
      session.creativeTemplates(
        new StatementBuilder()
        .where("status = :active and type = :userDefined")
        .withBindVariableValue("active", CreativeTemplateStatus._ACTIVE)
        .withBindVariableValue("userDefined", CreativeTemplateType._USER_DEFINED)
      ) filterNot { template =>
        val name = template.getName.toLowerCase
        name.startsWith("apps - ") || name.startsWith("as ") || name.startsWith("qc ")
      } map toGuCreativeTemplate
    }

    templates getOrElse Nil
  }

  def loadCreativeTemplatesModifiedSince(threshold: DateTime): Seq[GuCreative] = {

    def toGuCreative(dfpCreative: TemplateCreative) = {

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
        templateId = dfpCreative.getCreativeTemplateId
      )
    }

    val creatives = for (session <- SessionWrapper()) yield {
      session.creatives(
        new StatementBuilder()
        .where("lastModifiedDateTime > :threshold")
        .withBindVariableValue("threshold", threshold.getMillis)
      ) collect {
        case tc: TemplateCreative => tc
      } map toGuCreative
    }

    creatives getOrElse Nil
  }
}
