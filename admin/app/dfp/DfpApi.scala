package dfp

import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder
import com.google.api.ads.dfp.axis.v201508._
import common.Logging
import common.dfp.{GuCreative, GuCreativeTemplate}
import dfp.DataMapper.{toGuCreativeTemplate, toGuTemplateCreative}
import org.joda.time.DateTime

import scala.util.control.NonFatal

// this is replacing DfpDataHydrator
object DfpApi extends Logging {

  private def withDfpSession[T](stmtBuilder: => StatementBuilder)
    (block: (StatementBuilder, SessionWrapper) => Seq[T]): Seq[T] = {

    val maybeStatementBuilder = try {
      Some(stmtBuilder)
    } catch {
      case NonFatal(e) =>
        log.error(s"Building statement failed: ${e.getMessage}")
        None
    }

    val results = for {
      stmtBuilder <- maybeStatementBuilder
      session <- SessionWrapper()
    } yield block(stmtBuilder, session)

    results getOrElse Nil
  }

  def loadActiveCreativeTemplates(): Seq[GuCreativeTemplate] = {

    def stmtBuilder = new StatementBuilder()
                      .where("status = :active and type = :userDefined")
                      .withBindVariableValue("active", CreativeTemplateStatus._ACTIVE)
                      .withBindVariableValue("userDefined", CreativeTemplateType._USER_DEFINED)

    def isAppTemplate(template: CreativeTemplate): Boolean = {
      val name = template.getName.toLowerCase
      name.startsWith("apps - ") || name.startsWith("as ") || name.startsWith("qc ")
    }

    withDfpSession(stmtBuilder) { (stmtBuilder, session) =>
      session.creativeTemplates(stmtBuilder) filterNot isAppTemplate map toGuCreativeTemplate
    }
  }

  def loadTemplateCreativesModifiedSince(threshold: DateTime): Seq[GuCreative] = {

    def stmtBuilder = new StatementBuilder()
                      .where("lastModifiedDateTime > :threshold")
                      .withBindVariableValue("threshold", threshold.getMillis)

    withDfpSession(stmtBuilder) { (stmtBuilder, session) =>
      session.creatives.get(stmtBuilder) collect {
        case tc: TemplateCreative => tc
      } map toGuTemplateCreative
    }
  }
}
