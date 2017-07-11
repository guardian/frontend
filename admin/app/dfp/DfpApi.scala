package dfp

import com.google.api.ads.dfp.axis.utils.v201705.StatementBuilder
import com.google.api.ads.dfp.axis.v201705._
import common.Logging
import common.dfp._
import dfp.DataMapper.{toGuAdUnit, toGuCreativeTemplate, toGuCustomField, toGuLineItem, toGuTemplateCreative, toGuAdvertiser, toGuOrder}
import org.joda.time.DateTime

object DfpApi extends Logging {

  case class DfpLineItems(validItems: Seq[GuLineItem], invalidItems: Seq[GuLineItem])

  private def readLineItems(stmtBuilder: StatementBuilder): DfpLineItems = {

    val lineItems = withDfpSession( session => {
      session.lineItems(stmtBuilder)
        .map( dfpLineItem => {
          toGuLineItem(session)(dfpLineItem) -> dfpLineItem
        })
    })

    val validatedLineItems = lineItems
      .groupBy(Function.tupled(DataValidation.isGuLineItemValid))
      .mapValues(_.map(_._1))

    DfpLineItems(
      validItems = validatedLineItems.getOrElse(true, Nil),
      invalidItems = validatedLineItems.getOrElse(false, Nil))
  }

  def getAllOrders: Seq[GuOrder] = {
    val stmtBuilder = new StatementBuilder()
    withDfpSession(_.orders(stmtBuilder).map(toGuOrder))
  }

  def getAllCustomFields: Seq[GuCustomField] = {
    val stmtBuilder = new StatementBuilder()
    withDfpSession(_.customFields(stmtBuilder).map(toGuCustomField))
  }

  def getAllAdvertisers: Seq[GuAdvertiser] = {
    val stmtBuilder = new StatementBuilder()
                      .where("type = :type")
                      .withBindVariableValue("type", CompanyType.ADVERTISER.toString)
                      .orderBy("id ASC")

    withDfpSession(_.companies(stmtBuilder).map(toGuAdvertiser))
  }

  def readCurrentLineItems: DfpLineItems = {

    val stmtBuilder = new StatementBuilder()
                      .where("status = :readyStatus OR status = :deliveringStatus")
                      .withBindVariableValue("readyStatus", ComputedStatus.READY.toString)
                      .withBindVariableValue("deliveringStatus", ComputedStatus.DELIVERING.toString)
                      .orderBy("id ASC")

    readLineItems(stmtBuilder)
  }

  def readLineItemsModifiedSince(threshold: DateTime): DfpLineItems = {

    val stmtBuilder = new StatementBuilder()
                      .where("lastModifiedDateTime > :threshold")
                      .withBindVariableValue("threshold", threshold.getMillis)

    readLineItems(stmtBuilder)
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

  def getCreativeIds(lineItemId: Long): Seq[Long] = {
    val stmtBuilder = new StatementBuilder().where("status = :status AND lineItemId = :lineItemId")
      .withBindVariableValue("status", LineItemCreativeAssociationStatus._ACTIVE)
      .withBindVariableValue("lineItemId", lineItemId)

    withDfpSession { session =>
      session.lineItemCreativeAssociations.get(stmtBuilder) map (id => Long2long(id.getCreativeId))
    }
  }

  def getPreviewUrl(lineItemId: Long, creativeId: Long, url: String): Option[String] =
    for {
      session <- SessionWrapper()
      previewUrl <- session.lineItemCreativeAssociations.getPreviewUrl(lineItemId, creativeId, url)
    } yield previewUrl

  private def withDfpSession[T](block: SessionWrapper => Seq[T]): Seq[T] = {
    val results = for (session <- SessionWrapper()) yield block(session)
    results getOrElse Nil
  }
}
