package dfp


case class Target(name: String, op: String, values: Seq[String]) {

  def isPositive(targetName: String) = name == targetName && op == "IS"

  def isSlot(value: String) = isPositive("slot") && values.contains(value)

  val isSponsoredSlot = isSlot("spbadge")

  val isAdvertisementFeatureSlot = isSlot("adbadge")

  val isTag = isPositive("k") || isPositive("se")
}

case class TargetSet(op: String, targets: Seq[Target]) {
  def filterTags(bySlotType: Target => Boolean) ={
    if (targets exists bySlotType) {
      targets.filter(_.isTag).flatMap(_.values).distinct
    } else Nil
  }

  val sponsoredTags = filterTags(_.isSponsoredSlot)

  val advertisementFeatureTags = filterTags(_.isAdvertisementFeatureSlot)
}

case class LineItem(id: Long, targetSets: Seq[TargetSet]) {

  val sponsoredTags = targetSets.flatMap(_.sponsoredTags).distinct

  val advertisementFeatureTags = targetSets.flatMap(_.advertisementFeatureTags).distinct
}
