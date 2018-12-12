package model.readerRevenue

import org.joda.time.DateTime
import play.api.libs.json._
import conf.Configuration.readerRevenue._

case class ContributionsBannerDeploy(time: DateTime)

object ContributionsBannerDeploy {
  private implicit val jodaDateTimeFormats: Format[DateTime] =
    Format(JodaReads.jodaDateReads("yyyy-MM-dd'T'HH:mm:ssZ"), JodaWrites.jodaDateWrites("yyyy-MM-dd'T'HH:mm:ssZ"))
  implicit val deployFormat: OFormat[ContributionsBannerDeploy] = Json.format[ContributionsBannerDeploy]
}

sealed trait ReaderRevenueRegion { val name: String }
case object GB extends ReaderRevenueRegion { val name = "gb"}
case object US extends ReaderRevenueRegion { val name = "us"}
case object AU extends ReaderRevenueRegion { val name = "au"}
case object ROW extends ReaderRevenueRegion { val name = "row"}


object ReaderRevenueRegion {
  def fromString(region: String): Option[ReaderRevenueRegion] = {
    region.toLowerCase() match {
      case "gb" => Some(GB)
      case "us" => Some(US)
      case "au" => Some(AU)
      case "row" => Some(ROW)
      case _ => None
    }
  }

  def getBucketKey(region: ReaderRevenueRegion): String = {
    contributionsBannerDeployLogKey + "-" + region.name + ".json"
  }

  val allRegions: List[ReaderRevenueRegion] = List(GB, US, AU, ROW)
}

