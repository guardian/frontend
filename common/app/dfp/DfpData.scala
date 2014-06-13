package dfp


case class Target(name: String, op: String, values: Seq[String]) {

  def isPositive(targetName: String) = name == targetName && op == "IS"

  def isSlot(value: String) = isPositive("slot") && values.contains(value)

  val isSponsoredSlot = isSlot("spbadge")

  val isAdvertisementFeatureSlot = isSlot("adbadge")

  val isKeyword = isPositive("k")

  val isSeries = isPositive("se")
}

case class TargetSet(op: String, targets: Seq[Target]) {
  def filterTarget(byTagType: Target => Boolean)(bySlotType: Target => Boolean) ={
    if (targets exists bySlotType) {
      targets.filter(byTagType).flatMap(_.values).distinct
    } else Nil
  }

  val sponsoredKeywords = filterTarget(_.isKeyword)(_.isSponsoredSlot)

  val advertisementFeatureKeywords = filterTarget(_.isKeyword)(_.isAdvertisementFeatureSlot)

  val sponsoredSeriesTags = filterTarget(_.isSeries)(_.isSponsoredSlot)

  val advertisementFeatureSeriesTags = filterTarget(_.isSeries)(_.isAdvertisementFeatureSlot)

}

case class LineItem(id: Long, targetSets: Seq[TargetSet]) {

  val sponsoredKeywords = targetSets.flatMap(_.sponsoredKeywords).distinct

  val advertisementFeatureKeywords = targetSets.flatMap(_.advertisementFeatureKeywords).distinct

  val sponsoredSeriesTags = targetSets.flatMap(_.sponsoredSeriesTags).distinct

  val advertisementFeatureSeriesTags = targetSets.flatMap(_.advertisementFeatureSeriesTags).distinct
}
