package common.dfp

import common.{GuLogging}
import play.api.libs.json._

case class SurveySponsorship(
    lineItemName: String,
    lineItemId: Long,
    adUnits: Seq[String],
    countries: Seq[String],
    adTest: Option[String],
    targetsAdTest: Boolean,
) {
  def matchesTargetedAdTest(adTest: Option[String]): Boolean =
    if (this.targetsAdTest) { adTest == this.adTest }
    else { true }
}

object SurveySponsorship {
  implicit val surveySponsorshipFormat: Format[SurveySponsorship] = Json.format[SurveySponsorship]
}

case class SurveySponsorshipReport(
    updatedTimeStamp: Option[String],
    sponsorships: Seq[SurveySponsorship]
) {
  val (testSponsorships, deliverableSponsorships) = sponsorships partition (_.targetsAdTest)
}

object SurveySponsorshipReport {
  implicit val surveySponsorshipReportFormat: Format[SurveySponsorshipReport] =
    Json.format[SurveySponsorshipReport]
}

object SurveySponsorshipReportParser extends GuLogging {
  def apply(jsonString: String): Option[SurveySponsorshipReport] = {
    val json = Json.parse(jsonString)
    json.validate[SurveySponsorshipReport] match {
      case s: JsSuccess[SurveySponsorshipReport] => Some(s.get)
      case e: JsError                            => log.error("Errors: " + JsError.toJson(e).toString()); None
    }
  }
}
