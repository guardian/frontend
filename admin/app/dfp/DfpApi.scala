package dfp

// StatementBuilder query language is PQL defined here:
// https://developers.google.com/ad-manager/api/pqlreference
import com.google.api.ads.admanager.axis.utils.v202502.StatementBuilder
import com.google.api.ads.admanager.axis.v202502._
import com.madgag.scala.collection.decorators.MapDecorator
import common.GuLogging
import common.dfp._
import org.joda.time.DateTime

case class DfpLineItems(validItems: Seq[GuLineItem], invalidItems: Seq[GuLineItem])

class DfpApi(dataMapper: DataMapper) extends GuLogging {
  import dfp.DfpApi._

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
