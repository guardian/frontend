package model.readerRevenue

import org.joda.time.DateTime
import play.api.libs.json._
import conf.Configuration.readerRevenue._

case class BannerDeploy(time: DateTime)

object BannerDeploy {
  private implicit val jodaDateTimeFormats: Format[DateTime] =
    Format(JodaReads.jodaDateReads("yyyy-MM-dd'T'HH:mm:ssZ"), JodaWrites.jodaDateWrites("yyyy-MM-dd'T'HH:mm:ssZ"))
  implicit val deployFormat: OFormat[BannerDeploy] = Json.format[BannerDeploy]
}

sealed trait ReaderRevenueRegion {
  def name: String;
  override def toString: String = s"ReaderRevenueRegion: $name"
}

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

  def getBucketKey(region: ReaderRevenueRegion, bannerType: BannerType): String = {
    createBucketKeyForRegion(bannerType.logKey, region)
  }

  def createBucketKeyForRegion(bucketKey: String, region: ReaderRevenueRegion): String = {
    bucketKey + "-" + region.name + ".json"
  }

  val allRegions: List[ReaderRevenueRegion] = List(UK, US, AU, ROW)
}

sealed trait BannerType {
  def name: String
  def logKey: String
  def path: String

  override def toString: String = s"Banner type: $name; logKey: $logKey; path: $path"
}

case object ContributionsBanner extends BannerType {
  val name = "contributions-banner"
  val logKey: String = contributionsBannerDeployLogKey
  val path: String = subscriptionsPath
}

case object SubscriptionsBanner extends BannerType {
  val name = "subscriptions-banner"
  val logKey: String = subscriptionsBannerDeployLogKey
  val path: String = contributionsPath
}
