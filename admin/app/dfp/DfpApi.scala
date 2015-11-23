package dfp

import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder
import com.google.api.ads.dfp.axis.v201508._
import common.Logging
import common.dfp.{GuAdUnit, GuCreative, GuCreativeTemplate, GuLineItem}
import dfp.DataMapper.{toGuAdUnit, toGuCreativeTemplate, toGuLineItem, toGuTemplateCreative}
import org.joda.time.DateTime

import scala.util.control.NonFatal

// this is replacing DfpDataHydrator
object DfpApi extends Logging {

  def loadCurrentLineItems(): Seq[GuLineItem] = {

    def stmtBuilder = new StatementBuilder()
                      .where("status = :readyStatus OR status = :deliveringStatus")
                      .withBindVariableValue("readyStatus", ComputedStatus.READY.toString)
                      .withBindVariableValue("deliveringStatus", ComputedStatus.DELIVERING.toString)
                      .orderBy("id ASC")

    def sponsor(lineItem: LineItem) = for {
      sponsorFieldId <- CustomFieldAgent.get.data.get("Sponsor")
      customFieldValues <- Option(lineItem.getCustomFieldValues)
      sponsor <- customFieldValues.collect {
        case fieldValue: CustomFieldValue if fieldValue.getCustomFieldId == sponsorFieldId =>
          fieldValue.getValue.asInstanceOf[TextValue].getValue
      }.headOption
    } yield sponsor

    def placementAdUnitIds(session: SessionWrapper, placementId: Long): Seq[String] = {
      lazy val fallback = {
        val stmtBuilder = new StatementBuilder().where("id = :id").withBindVariableValue("id", placementId)
        session.placements(stmtBuilder) flatMap (_.getTargetedAdUnitIds.toSeq)
      }
      PlacementAgent.get.data getOrElse(placementId, fallback)
    }

    def adUnit(session: SessionWrapper, adUnitId: String): GuAdUnit = {
      val cachedData = AdUnitAgent.get.data
      lazy val fallback = {
        val stmtBuilder = new StatementBuilder().where("id = :id").withBindVariableValue("id", adUnitId)
        toGuAdUnit(session.adUnits(stmtBuilder).head, cachedData)
      }
      cachedData getOrElse(adUnitId, fallback)
    }

    def targetingKey(session: SessionWrapper, keyId: Long): String = {
      lazy val fallback = {
        val stmtBuilder = new StatementBuilder().where("id = :id").withBindVariableValue("id", keyId)
        session.customTargetingKeys(stmtBuilder).head.getName
      }
      CustomTargetingKeyAgent.get.data getOrElse(keyId, fallback)
    }

    def targetingValue(session: SessionWrapper, valueId: Long): String = {
      lazy val fallback = {
        val stmtBuilder = new StatementBuilder().where("id = :id").withBindVariableValue("id", valueId)
        session.customTargetingValues(stmtBuilder).head.getName
      }
      CustomTargetingKeyAgent.get.data getOrElse(valueId, fallback)
    }

    withDfpSession(stmtBuilder) { session =>
      session.lineItems(stmtBuilder) map { lineItem =>
        toGuLineItem(
          lineItem,
          sponsor(lineItem),
          placementAdUnitIds(session, _),
          adUnit(session, _),
          targetingKey(session, _),
          targetingValue(session, _)
        )
      }
    }
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

    withDfpSession(stmtBuilder) {
      _.creativeTemplates(stmtBuilder) filterNot isAppTemplate map toGuCreativeTemplate
    }
  }

  def loadTemplateCreativesModifiedSince(threshold: DateTime): Seq[GuCreative] = {

    def stmtBuilder = new StatementBuilder()
                      .where("lastModifiedDateTime > :threshold")
                      .withBindVariableValue("threshold", threshold.getMillis)

    withDfpSession(stmtBuilder) {
      _.creatives(stmtBuilder) collect { case creative: TemplateCreative => creative } map toGuTemplateCreative
    }
  }

  private def withDfpSession[T](stmtBuilder: => StatementBuilder)(block: SessionWrapper => Seq[T]): Seq[T] = {

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
    } yield block(session)

    results getOrElse Nil
  }
}
