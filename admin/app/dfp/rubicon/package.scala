package dfp

import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder
import com.google.api.ads.dfp.axis.v201508.{LineItemCreativeAssociationStatus, ThirdPartyCreative}
import common.Logging

import scala.util.matching.Regex

package object rubicon extends Logging {

  def withDfpSession[T](networkId: String)(block: SessionWrapper => Seq[T]): Seq[T] = {
    val results = for {
      session <- SessionWrapper(Some(networkId))
    } yield block(session)
    results getOrElse Nil
  }

  def creativesByOrder(networkId: String, orderId: Long): Seq[ThirdPartyCreative] = {

    val lineItemStmtBuilder = new StatementBuilder().where(s"orderId = $orderId")

    def licaStmtBuilder(lineItemIds: Seq[Long]) = {
      val lineItems = lineItemIds.mkString(",")
      new StatementBuilder()
      .where(s"status = :status AND lineItemId IN ($lineItems)")
      .withBindVariableValue("status", LineItemCreativeAssociationStatus._ACTIVE)
    }

    def creativeStmtBuilder(creativeIds: Seq[Long]) =
      new StatementBuilder().where(s"id IN (${creativeIds.mkString(",")})")

    withDfpSession(networkId) { session =>
      val lineItemIds = session.lineItems(lineItemStmtBuilder) map (_.getId.toLong)
      val creativeIds = session.lineItemCreativeAssociations.get(licaStmtBuilder(lineItemIds)) map {
        _.getCreativeId.toLong
      }
      session.creatives.get(creativeStmtBuilder(creativeIds)) collect {
        case creative: ThirdPartyCreative => creative
      }
    }
  }

  def siteValue(creative: ThirdPartyCreative): Option[String] = {
    value(creative, "rp_site\\s*=\\s*'(\\d{5})'".r.unanchored)
  }

  def zoneValue(creative: ThirdPartyCreative): Option[String] = {
    value(creative, "rp_zonesize\\s*=\\s*'(\\d{5,6})\\-\\d{1,2}'".r.unanchored)
  }

  def sizeValue(creative: ThirdPartyCreative): Option[String] = {
    value(creative, "rp_zonesize\\s*=\\s*'\\d{5,6}\\-(\\d{1,2})'".r.unanchored)
  }

  def value(creative: ThirdPartyCreative, regex: Regex): Option[String] = {
    creative.getSnippet match {
      case regex(value) =>
        Some(value)
      case _ =>
        log.warn(s"No match for $regex in ${creative.getId}: ${creative.getSnippet}")
        None
    }
  }
}
