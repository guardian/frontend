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
case object UK extends ReaderRevenueRegion { val name = "united-kingdom"}
case object US extends ReaderRevenueRegion { val name = "united-states"}
case object AU extends ReaderRevenueRegion { val name = "australia"}
case object ROW extends ReaderRevenueRegion { val name = "rest-of-world"}

object ReaderRevenueRegion {
  def fromString(region: String): Option[ReaderRevenueRegion] = {
    region.toLowerCase() match {
      case "united-kingdom" => Some(UK)
      case "united-states" => Some(US)
      case "australia" => Some(AU)
      case "rest-of-world" => Some(ROW)
      case _ => None
    }
  }

  def getBucketKey(region: ReaderRevenueRegion, banner: BannerType): String = {
      banner match {
        case ContributionsBanner => createBucketKeyForRegion(contributionsBannerDeployLogKey, region)
        case SubscriptionsBanner => createBucketKeyForRegion(subscriptionsBannerDeployLogKey, region)
      }

//    contributionsBannerDeployLogKey + "-" + region.name + ".json"
  }

//  def getNewBucketKey(region: ReaderRevenueRegion, banner: BannerType): String = {
//    subscriptionsBannerDeployLogKey + "-" + region.name + ".json"
//  }
  def createBucketKeyForRegion(bucketKey: String, region: ReaderRevenueRegion): String = {
    bucketKey + "-" + region.name + ".json"
  }

  val allRegions: List[ReaderRevenueRegion] = List(UK, US, AU, ROW)
}

sealed trait BannerType { val name: String }
case object ContributionsBanner extends BannerType { val name = "contributions-banner" }
case object SubscriptionsBanner extends BannerType { val name = "subscriptions-banner" }
