package dfp

case class Target(name: String, op: String, values: Seq[String]) {

  def isPositive(targetName: String) = name == targetName && op == "IS"

  def isSlot(value: String) = isPositive("slot") && values.contains(value)

  val isSponsoredSlot = isSlot("spbadge")

  val isAdvertisementFeatureSlot = isSlot("adbadge")

  val isKeyword = isPositive("k")
}

case class TargetSet(op: String, targets: Seq[Target]) {

  def keywords(p: Target => Boolean): Seq[String] = {
    if (targets exists p) {
      targets.filter(_.isKeyword).flatMap(_.values).distinct
    }
    else Nil
  }

  val sponsoredKeywords = keywords(_.isSponsoredSlot)

  val advertisementFeatureKeywords = keywords(_.isAdvertisementFeatureSlot)
}

case class LineItem(id: Long, targetSets: Seq[TargetSet]) {

  val sponsoredKeywords = targetSets.flatMap(_.sponsoredKeywords).distinct

  val advertisementFeatureKeywords = targetSets.flatMap(_.advertisementFeatureKeywords).distinct
}

case class DfpData(lineItems: Seq[LineItem]) {

  val sponsoredKeywords = lineItems.flatMap(_.sponsoredKeywords).distinct

  val advertisementFeatureKeywords = lineItems.flatMap(_.sponsoredKeywords).distinct

  def isSponsored(keyword: String) = sponsoredKeywords contains keyword

  def isAdvertisementFeature(keyword: String) = advertisementFeatureKeywords contains keyword
}
