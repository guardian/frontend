package dfp

import org.scalatest.{FlatSpec, Matchers}

class SponsorshipReportTest extends FlatSpec with Matchers {
  val jsonString =
    """{"updatedTimeStamp":"Sun 20:14 22 June 2014",
      |"sponsorships":[
      |{"tags":["live-better"],"sponsor":"Unilever","countries":[],"lineItemId":1},
      |{"tags":["secure-protect"],"sponsor":null,"countries":[],"lineItemId":2},
      |{"tags":["world-cup-football","world-cup-2014"],"sponsor":null,"countries":[],"lineItemId":3},
      |{"tags":["cricket"],"sponsor":null,"countries":[],"lineItemId":4},
      |{"tags":["world-cup-show-2014"],"sponsor":null,"countries":[],"lineItemId":5}
      |]
    }""".stripMargin

  "SponsorshipReports object" should "be able to hydrate proper SponsorshipReports object" in {
    val result: Option[SponsorshipReport] = SponsorshipReportParser(jsonString)
    result.isDefined shouldEqual true
    val report: SponsorshipReport = result.get

    report.updatedTimeStamp shouldEqual "Sun 20:14 22 June 2014"
    report.sponsorships.size shouldEqual 5
    val liveBetter: Sponsorship = report.sponsorships(0)
    liveBetter.sponsor should equal(Some("Unilever"))
    liveBetter.tags should contain("live-better")
    liveBetter.lineItemId shouldEqual 1

    val secureProtect: Sponsorship = report.sponsorships(1)
    secureProtect.sponsor should equal(None)
    secureProtect.tags should contain("secure-protect")
    secureProtect.lineItemId shouldEqual 2
  }

}
