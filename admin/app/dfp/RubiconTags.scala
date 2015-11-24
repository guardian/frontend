package dfp

import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder
import com.google.api.ads.dfp.axis.v201508.ThirdPartyCreative
import common.Logging
import common.dfp.GuCreative
import dfp.DataMapper.toGuThirdPartyCreative

import scala.util.matching.Regex

object RubiconTags extends Logging {

  def sites(creatives: Seq[GuCreative]): Seq[Int] = sortedDistinctValues(creatives, "rp_site\\s*=\\s*'(\\d{5})'".r)

  def zones(creatives: Seq[GuCreative]): Seq[Int] =
    sortedDistinctValues(creatives, "rp_zonesize\\s*=\\s*'(\\d{5,6})\\-\\d{1,2}'".r)

  def sizes(creatives: Seq[GuCreative]): Seq[Int] =
    sortedDistinctValues(creatives, "rp_zonesize\\s*=\\s*'\\d{5,6}\\-(\\d{1,2})'".r)

  private def sortedDistinctValues(creatives: Seq[GuCreative], regex: Regex): Seq[Int] = {

    def value(creative: GuCreative): Option[Int] = {
      val result = regex findFirstMatchIn creative.snippet.get map (_ group 1)
      if (result.isEmpty) {
        log.error(s"match error in ${creative.id}: ${creative.snippet.get}")
      }
      result map(_.toInt)
    }

    (creatives flatMap value).sorted.distinct
  }

  def creatives: Seq[GuCreative] = {

    def creatives(orderId: Long): Seq[GuCreative] = {

      val lineItemStmtBuilder = new StatementBuilder().where(s"orderId = $orderId")

      def licaStmtBuilder(lineItemIds: Seq[Long]) = new StatementBuilder()
                                                    .where(s"lineItemId IN (${lineItemIds.mkString(",")})")

      def creativeStmtBuilder(creativeIds: Seq[Long]) = new StatementBuilder()
                                                        .where(s"id IN (${creativeIds.mkString(",")})")

      withDfpSession { session =>

        val lineItemIds = session.lineItems(lineItemStmtBuilder) map (_.getId.toLong)

        val creativeIds =
          session.lineItemCreativeAssociations(licaStmtBuilder(lineItemIds)) map {
            _.getCreativeId.toLong
          }

        session.creatives(creativeStmtBuilder(creativeIds)) collect {
          case creative: ThirdPartyCreative => creative
        } map toGuThirdPartyCreative
      }
    }

    val ukOrder = 171545367
    val ukMobileOrder = 170179047
    val rowOrder = 171110367
    val rowMobileOrder = 172731927
    val orderIds: Seq[Long] = Seq(ukOrder, ukMobileOrder, rowOrder, rowMobileOrder)

    orderIds flatMap creatives
  }

  private def withDfpSession[T](block: SessionWrapper => Seq[T]): Seq[T] = {
    val results = for {
      session <- SessionWrapper()
    } yield block(session)

    results getOrElse Nil
  }
}
