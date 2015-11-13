package dfp

import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder
import com.google.api.ads.dfp.axis.v201508._
import common.dfp.{GuCreative, GuCreativeTemplate, GuCreativeTemplateParameter}
import dfp.ApiHelper.toJodaTime
import org.joda.time.DateTime

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
      ) map toGuCreativeTemplate
    }

    templates getOrElse Nil
  }

  def loadCreativeTemplatesModifiedSince(threshold: DateTime): Seq[GuCreative] = {

    def toGuCreative(dfpCreative: Creative) = GuCreative(
      id = dfpCreative.getId,
      name = dfpCreative.getName,
      lastModified = toJodaTime(dfpCreative.getLastModifiedDateTime),
      args = Map.empty
    )

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
