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


case class LineItem(id: Long, sponsor: Option[String], targetSets: Seq[TargetSet]) {

  val sponsoredTags = targetSets.flatMap(_.sponsoredTags).distinct

  val advertisementFeatureTags = targetSets.flatMap(_.advertisementFeatureTags).distinct
}


case class Sponsorship(tags: Seq[String], sponsor: Option[String]) {

  def hasTag(tagId: String): Boolean = tags contains (tagId.split('/').last)
}

case class SponsorshipReport(updatedTimeStamp: String, sponsorships: Seq[Sponsorship])

object SponsorshipReportParser {
  import play.api.libs.json._
  import play.api.libs.functional.syntax._


  def apply(jsonString: String) = {
    implicit val sponsorshipReads: Reads[Sponsorship] = (
      (JsPath \ "tags").read[Seq[String]] and
        (JsPath \ "sponsor").read[Option[String]]
      )(Sponsorship.apply _)

    implicit val sponsorshipReportReads: Reads[SponsorshipReport] = (
      (JsPath \ "updatedTimeStamp").read[String] and
        (JsPath \ "sponsorships").read[Seq[Sponsorship]]
      )(SponsorshipReport.apply _)


    val result: JsResult[SponsorshipReport] = Json.parse(jsonString).validate[SponsorshipReport]
    result match {
      case s: JsSuccess[SponsorshipReport] => Some(s.get)
      case e: JsError => println("Errors: " + JsError.toFlatJson(e).toString()); None
    }
  }
}