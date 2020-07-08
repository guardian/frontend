package model.readerRevenue

import org.joda.time.DateTime
import play.api.libs.json._
import conf.Configuration.readerRevenue._

case class BannerDeploy(time: Long)

object BannerDeploy {
  implicit val deployFormat = Json.format[BannerDeploy]
}

sealed trait ReaderRevenueRegion {
  def name: String
  override def toString: String = s"ReaderRevenueRegion: $name"
}

case object UK extends ReaderRevenueRegion { val name = "united-kingdom"}
case object US extends ReaderRevenueRegion { val name = "united-states"}
case object AU extends ReaderRevenueRegion { val name = "australia"}
case object ROW extends ReaderRevenueRegion { val name = "rest-of-world"}
case object EU extends ReaderRevenueRegion { val name = "european-union"}

object ReaderRevenueRegion {

  val allRegions: List[ReaderRevenueRegion] = List(UK, US, AU, ROW, EU)

  def fromName(region: String): Option[ReaderRevenueRegion] = {
    val toFind = region.toLowerCase()
    allRegions.find(_.name == toFind)
  }

  def getBucketKey(region: ReaderRevenueRegion, bannerType: BannerType): String = {
    createBucketKeyForRegion(bannerType.logKey, region)
  }

  def createBucketKeyForRegion(bucketKey: String, region: ReaderRevenueRegion): String = {
    bucketKey + "-" + region.name + ".json"
  }

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
  val path: String = contributionsPath
}

case object SubscriptionsBanner extends BannerType {
  val name = "subscriptions-banner"
  val logKey: String = subscriptionsBannerDeployLogKey
  val path: String = subscriptionsPath
}
