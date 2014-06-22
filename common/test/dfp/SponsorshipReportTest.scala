package dfp

import org.scalatest.FlatSpec
import org.scalatest.Matchers
import play.api.test.Helpers._
import play.api.libs.json.{JsValue, Json}

class SponsorShipReportTest extends FlatSpec with Matchers {
  val jsonString =
    """{"updatedTimeStamp":"Sun 20:14 22 June 2014",
      |"sponsorships":
      |[{"sponsor":"Unilever","tags":["live-better"]},{"sponsor":null,"tags":["secure-protect"]},{"sponsor":null,"tags":["world-cup-football","world-cup-2014"]},{"sponsor":null,"tags":["cricket"]},{"sponsor":null,"tags":["world-cup-show-2014"]}]
    }""".stripMargin

  "SponsorshipReports object" should "be able to hydrate proper SponsorshipReports object" in {
    val result: Option[SponsorshipReport] = SponsorshipReportParser(jsonString)
    result.isDefined shouldEqual(true)
    val report: SponsorshipReport = result.get

    report.updatedTimeStamp shouldEqual("Sun 20:14 22 June 2014")
    report.sponsorships.size shouldEqual(5)
    val liveBetter: Sponsorship = report.sponsorships(0)
    liveBetter.sponsor should equal(Some("Unilever"))
    liveBetter.tags should contain("live-better")

    val secureProtect: Sponsorship = report.sponsorships(1)
    secureProtect.sponsor should equal(None)
    secureProtect.tags should contain("secure-protect")
  }


}