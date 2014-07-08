package dfp

import org.joda.time.DateTime

case class CustomTarget(name: String, op: String, values: Seq[String]) {

  def isPositive(targetName: String) = name == targetName && op == "IS"

  def isSlot(value: String) = isPositive("slot") && values.contains(value)

  val isSponsoredSlot = isSlot("spbadge")

  val isAdvertisementFeatureSlot = isSlot("adbadge")

  val isTag = isPositive("k") || isPositive("se")
}


case class CustomTargetSet(op: String, targets: Seq[CustomTarget]) {
  def filterTags(bySlotType: CustomTarget => Boolean) = {
    if (targets exists bySlotType) {
      targets.filter(_.isTag).flatMap(_.values).distinct
    } else Nil
  }

  val sponsoredTags = filterTags(_.isSponsoredSlot)

  val advertisementFeatureTags = filterTags(_.isAdvertisementFeatureSlot)
}


case class GeoTarget(id: Long, parentId: Option[Int], locationType: String, name: String)


case class GuAdUnit(id: String, path: Seq[String])


case class GuTargeting(adUnits: Seq[GuAdUnit], geoTargets: Seq[GeoTarget], customTargetSets: Seq[CustomTargetSet])


case class GuLineItem(id: Long,
                      name: String,
                      startTime: DateTime,
                      isPageSkin: Boolean,
                      sponsor: Option[String],
                      targeting: GuTargeting) {

  val sponsoredTags: Seq[String] = targeting.customTargetSets.flatMap(_.sponsoredTags).distinct

  val advertisementFeatureTags: Seq[String] = targeting.customTargetSets.flatMap(_.advertisementFeatureTags).distinct
}
