package dfp

import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder
import com.google.api.ads.dfp.axis.v201508._
import common.Logging
import common.dfp.{GuAdUnit, GuCreative, GuCreativeTemplate, GuLineItem}
import dfp.DataMapper.{toGuAdUnit, toGuCreativeTemplate, toGuLineItem, toGuTemplateCreative}
import org.joda.time.DateTime

object DfpApi extends Logging {

  private def readLineItems(stmtBuilder: StatementBuilder): Seq[GuLineItem] = {

    withDfpSession( session => {
      session.lineItems(stmtBuilder)
        .map( dfpLineItem => {
          toGuLineItem(session)(dfpLineItem) -> dfpLineItem
        })
        .filter(Function.tupled(DataValidation.isGuLineItemValid))
        .map({
          case (guLineItem, _) => guLineItem
        })
    })
  }

  def readCurrentLineItems(): Seq[GuLineItem] = {

    val stmtBuilder = new StatementBuilder()
                      .where("status = :readyStatus OR status = :deliveringStatus")
                      .withBindVariableValue("readyStatus", ComputedStatus.READY.toString)
                      .withBindVariableValue("deliveringStatus", ComputedStatus.DELIVERING.toString)
                      .orderBy("id ASC")

    readLineItems(stmtBuilder)
  }

  def readLineItemsModifiedSince(threshold: DateTime): Seq[GuLineItem] = {

    val stmtBuilder = new StatementBuilder()
                      .where("lastModifiedDateTime > :threshold")
                      .withBindVariableValue("threshold", threshold.getMillis)

    readLineItems(stmtBuilder)
  }

  def readAdFeatureLogoLineItems(expiredSince: DateTime, expiringBefore: DateTime): Seq[GuLineItem] = {

    val stmtBuilder = new StatementBuilder()
                      .where(
                        "LineItemType = :sponsored AND " +
                        "Status != :draft AND " +
                        "EndDateTime > :startTime AND " +
                        "EndDateTime < :endTime"
                      )
                      .withBindVariableValue("sponsored", LineItemType.SPONSORSHIP.toString)
                      .withBindVariableValue("draft", ComputedStatus.DRAFT.toString)
                      .withBindVariableValue("startTime", expiredSince.getMillis)
                      .withBindVariableValue("endTime", expiringBefore.getMillis)

    readLineItems(stmtBuilder) filter (_.isAdFeatureLogo)
  }

  def readActiveCreativeTemplates(): Seq[GuCreativeTemplate] = {

    val stmtBuilder = new StatementBuilder()
                      .where("status = :active and type = :userDefined")
                      .withBindVariableValue("active", CreativeTemplateStatus._ACTIVE)
                      .withBindVariableValue("userDefined", CreativeTemplateType._USER_DEFINED)

    withDfpSession {
      _.creativeTemplates(stmtBuilder) map toGuCreativeTemplate filterNot (_.isForApps)
    }
  }

  def readTemplateCreativesModifiedSince(threshold: DateTime): Seq[GuCreative] = {

    val stmtBuilder = new StatementBuilder()
                      .where("lastModifiedDateTime > :threshold")
                      .withBindVariableValue("threshold", threshold.getMillis)

    withDfpSession {
      _.creatives.get(stmtBuilder) collect { case creative: TemplateCreative => creative } map toGuTemplateCreative
    }
  }

  private def readDescendantAdUnits(rootName: String, stmtBuilder: StatementBuilder): Seq[GuAdUnit] = {
    withDfpSession { session =>
      session.adUnits(stmtBuilder) filter { adUnit =>

        def isRoot(path: Array[AdUnitParent]) = path.length == 1 && adUnit.getName == rootName
        def isDescendant(path: Array[AdUnitParent]) = path.length > 1 && path(1).getName == rootName

        Option(adUnit.getParentPath) exists { path => isRoot(path) || isDescendant(path) }
      } map toGuAdUnit sortBy (_.id)
    }
  }

  def readActiveAdUnits(rootName: String): Seq[GuAdUnit] = {

    val stmtBuilder = new StatementBuilder()
                      .where("status = :status")
                      .withBindVariableValue("status", InventoryStatus._ACTIVE)

    readDescendantAdUnits(rootName, stmtBuilder)
  }

  def readSpecialAdUnits(rootName: String): Seq[(String, String)] = {

    val statementBuilder = new StatementBuilder()
                           .where("status = :status")
                           .where("explicitlyTargeted = :targeting")
                           .withBindVariableValue("status", InventoryStatus._ACTIVE)
                           .withBindVariableValue("targeting", true)

    readDescendantAdUnits(rootName, statementBuilder) map { adUnit =>
      (adUnit.id, adUnit.path.mkString("/"))
    } sortBy (_._2)
  }

  private def withDfpSession[T](block: SessionWrapper => Seq[T]): Seq[T] = {
    val results = for (session <- SessionWrapper()) yield block(session)
    results getOrElse Nil
  }
}
