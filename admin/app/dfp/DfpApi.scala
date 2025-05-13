package dfp

// StatementBuilder query language is PQL defined here:
// https://developers.google.com/ad-manager/api/pqlreference
import com.google.api.ads.admanager.axis.utils.v202405.StatementBuilder
import com.google.api.ads.admanager.axis.v202405._
import com.madgag.scala.collection.decorators.MapDecorator
import common.GuLogging
import common.dfp._
import org.joda.time.DateTime

case class DfpLineItems(validItems: Seq[GuLineItem], invalidItems: Seq[GuLineItem])

class DfpApi(dataMapper: DataMapper, dataValidation: DataValidation) extends GuLogging {
  import dfp.DfpApi._

  private def readLineItems(
      stmtBuilder: StatementBuilder,
      postFilter: LineItem => Boolean = _ => true,
  ): DfpLineItems = {

    val lineItems = withDfpSession(session => {
      session
        .lineItems(stmtBuilder)
        .filter(postFilter)
        .map(dfpLineItem => {
          (dataMapper.toGuLineItem(session)(dfpLineItem), dfpLineItem)
        })
    })

    // Note that this will call getTargeting on each
    // item, potentially making one API call per lineitem.
    val validatedLineItems = lineItems
      .groupBy(Function.tupled(dataValidation.isGuLineItemValid))
      .mapV(_.map(_._1))

    DfpLineItems(
      validItems = validatedLineItems.getOrElse(true, Nil),
      invalidItems = validatedLineItems.getOrElse(false, Nil),
    )
  }

  def getAllOrders: Seq[GuOrder] = {
    val stmtBuilder = new StatementBuilder()
    withDfpSession(_.orders(stmtBuilder).map(dataMapper.toGuOrder))
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

  def readSponsorshipLineItemIds(): Seq[Long] = {

    // The advertiser ID for "Amazon Transparent Ad Marketplace"
    val amazonAdvertiserId = 4751525411L

    val stmtBuilder = new StatementBuilder()
      .where(
        "(status = :readyStatus OR status = :deliveringStatus) AND lineItemType = :sponsorshipType AND advertiserId != :amazonAdvertiserId",
      )
      .withBindVariableValue("readyStatus", ComputedStatus.READY.toString)
      .withBindVariableValue("deliveringStatus", ComputedStatus.DELIVERING.toString)
      .withBindVariableValue("sponsorshipType", LineItemType.SPONSORSHIP.toString)
      .withBindVariableValue("amazonAdvertiserId", amazonAdvertiserId.toString)
      .orderBy("id ASC")

    // Lets avoid Prebid lineitems
    val IsPrebid = "(?i).*?prebid.*".r

    val lineItems = readLineItems(
      stmtBuilder,
      lineItem => {
        lineItem.getName match {
          case IsPrebid() => false
          case _          => true
        }
      },
    )
    (lineItems.validItems.map(_.id) ++ lineItems.invalidItems.map(_.id)).sorted
  }

  def readActiveCreativeTemplates(): Seq[GuCreativeTemplate] = {

    val stmtBuilder = new StatementBuilder()
      .where("status = :active and type = :userDefined")
      .withBindVariableValue("active", CreativeTemplateStatus._ACTIVE)
      .withBindVariableValue("userDefined", CreativeTemplateType._USER_DEFINED)

    withDfpSession {
      _.creativeTemplates(stmtBuilder) map dataMapper.toGuCreativeTemplate filterNot (_.isForApps)
    }
  }

  def readTemplateCreativesModifiedSince(threshold: DateTime): Seq[GuCreative] = {

    val stmtBuilder = new StatementBuilder()
      .where("lastModifiedDateTime > :threshold")
      .withBindVariableValue("threshold", threshold.getMillis)

    withDfpSession {
      _.creatives.get(stmtBuilder) collect { case creative: TemplateCreative =>
        creative
      } map dataMapper.toGuTemplateCreative
    }
  }

  private def readDescendantAdUnits(rootName: String, stmtBuilder: StatementBuilder): Seq[GuAdUnit] = {
    withDfpSession { session =>
      session.adUnits(stmtBuilder) filter { adUnit =>
        def isRoot(path: Array[AdUnitParent]) = path.length == 1 && adUnit.getName == rootName
        def isDescendant(path: Array[AdUnitParent]) = path.length > 1 && path(1).getName == rootName

        Option(adUnit.getParentPath) exists { path => isRoot(path) || isDescendant(path) }
      } map dataMapper.toGuAdUnit sortBy (_.id)
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
    val stmtBuilder = new StatementBuilder()
      .where("status = :status AND lineItemId = :lineItemId")
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

  def getReportQuery(reportId: Long): Option[ReportQuery] =
    for {
      session <- SessionWrapper()
      query <- session.getReportQuery(reportId)
    } yield query

  def runReportJob(report: ReportQuery): Seq[String] = {
    withDfpSession { session =>
      session.runReportJob(report)
    }
  }
}

object DfpApi {
  def withDfpSession[T](block: SessionWrapper => Seq[T]): Seq[T] = {
    val results = for (session <- SessionWrapper()) yield block(session)
    results getOrElse Nil
  }
}
