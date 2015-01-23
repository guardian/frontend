package dfp

import org.scalatest.{FlatSpec, Matchers}
import play.api.libs.json.Json

class PaidForTagTest extends FlatSpec with Matchers {

  val jsonString =
    """{"updatedTimeStamp":"December 30, 2014 10:37:28 AM GMT","paidForTags":[{"targetedName":"accessing-expertise","tagType":"keyword","paidForType":"sponsoredfeatures","matchingCapiTagIds":["small-business-network-partner-zone-lloyds-tsb/accessing-expertise","small-business-network/accessing-expertise"],"lineItems":[{"id":76753047,"name":"DF-6056 Kia Accessing Expertise - Oct14 - Hub - Logo","startTime":"2014-10-30T00:00:00.000Z","endTime":"2015-01-30T23:59:00.000Z","isPageSkin":false,"sponsor":"KIA","status":"OK","targeting":{"adUnits":[{"id":"59351727","path":["theguardian.com","small-business-network"]}],"geoTargetsIncluded":[{"id":2826,"parentId":null,"locationType":"COUNTRY","name":"United Kingdom"}],"geoTargetsExcluded":[],"customTargetSets":[{"op":"AND","targets":[{"name":"slot","op":"IS","values":["spbadge"]},{"name":"k","op":"IS","values":["accessing-expertise"]}]}]}}]},{"targetedName":"live-better","tagType":"keyword","paidForType":"sponsoredfeatures","matchingCapiTagIds":["lifeandstyle/live-better"],"lineItems":[{"id":73773567,"name":"Unilever Logo Live Better Hub","startTime":"2014-09-03T16:02:00.000+01:00","endTime":"2015-07-31T23:59:00.000+01:00","isPageSkin":false,"sponsor":"Unilever","status":"OK","targeting":{"adUnits":[],"geoTargetsIncluded":[],"geoTargetsExcluded":[],"customTargetSets":[{"op":"AND","targets":[{"name":"k","op":"IS","values":["live-better"]},{"name":"slot","op":"IS","values":["spbadge"]}]}]}}]},{"targetedName":"live-better-unilever","tagType":"keyword","paidForType":"advertisement-features","matchingCapiTagIds":["live-better-unilever/live-better-unilever"],"lineItems":[{"id":76221087,"name":"Next Gen Badge Unilever PZ RON","startTime":"2014-10-10T17:21:00.000+01:00","endTime":"2015-10-31T23:59:00.000Z","isPageSkin":false,"sponsor":"Unilever","status":"OK","targeting":{"adUnits":[{"id":"59342247","path":["theguardian.com"]}],"geoTargetsIncluded":[],"geoTargetsExcluded":[],"customTargetSets":[{"op":"AND","targets":[{"name":"k","op":"IS","values":["live-better-unilever"]},{"name":"slot","op":"IS","values":["adbadge"]}]}]}}]},{"targetedName":"science-behind-sustainability-solutions","tagType":"series","paidForType":"sponsoredfeatures","matchingCapiTagIds":["sustainable-business/series/science-behind-sustainability-solutions"],"lineItems":[{"id":77251647,"name":"Arizona State University 2014 Series - LOGO","startTime":"2014-10-31T20:52:00.000Z","endTime":"2016-01-01T04:59:00.000Z","isPageSkin":false,"sponsor":"Arizona State University","status":"OK","targeting":{"adUnits":[{"id":"59350887","path":["theguardian.com","sustainable-business"]}],"geoTargetsIncluded":[],"geoTargetsExcluded":[],"customTargetSets":[{"op":"AND","targets":[{"name":"se","op":"IS","values":["science-behind-sustainability-solutions"]},{"name":"slot","op":"IS","values":["spbadge"]}]}]}}]},{"targetedName":"secure-protect","tagType":"series","paidForType":"advertisement-features","matchingCapiTagIds":["technology/series/secure-protect"],"lineItems":[{"id":73773447,"name":"Next Gen Badges Secure + Protect","startTime":"2014-09-03T16:05:00.000+01:00","endTime":"2015-10-31T23:59:00.000Z","isPageSkin":false,"sponsor":"Fujitsu & Symantec","status":"OK","targeting":{"adUnits":[],"geoTargetsIncluded":[],"geoTargetsExcluded":[],"customTargetSets":[{"op":"AND","targets":[{"name":"se","op":"IS","values":["secure-protect"]},{"name":"slot","op":"IS","values":["spbadge"]}]}]}}]},{"targetedName":"shelter-partner-zone","tagType":"keyword","paidForType":"advertisement-features","matchingCapiTagIds":["shelter-partner-zone/shelter-partner-zone"],"lineItems":[{"id":79095447,"name":"GJ Shelter London BADGE 091214 DF-7254","startTime":"2014-12-09T16:59:00.000Z","endTime":"2015-12-09T23:59:00.000Z","isPageSkin":false,"sponsor":"SHELTER LONDON","status":"OK","targeting":{"adUnits":[{"id":"59342247","path":["theguardian.com"]}],"geoTargetsIncluded":[],"geoTargetsExcluded":[],"customTargetSets":[{"op":"AND","targets":[{"name":"slot","op":"IS","values":["adbadge"]},{"name":"k","op":"IS","values":["shelter-partner-zone"]}]}]}}]}]}"""

  "SponsorshipReports object" should "be able to hydrate proper SponsorshipReports object" in {
    val result: Option[PaidForTagsReport] = Json.parse(jsonString).asOpt[PaidForTagsReport]
    result.isDefined shouldEqual true
    val report: PaidForTagsReport = result.get

    report.updatedTimeStamp shouldEqual "December 30, 2014 10:37:28 AM GMT"
    report.sponsoredKeywords.size shouldEqual 2
    val liveBetter: PaidForTag = report.sponsoredKeywords(1)
    liveBetter.lineItems.head.sponsor should equal(Some("Unilever"))
    liveBetter.targetedName should equal("live-better")
    liveBetter.lineItems.head.id shouldEqual 73773567

    val secureProtect: PaidForTag = report.advertisementFeatureSeries(0)
    secureProtect.lineItems.head.sponsor should equal(Some("Fujitsu & Symantec"))
    secureProtect.targetedName should equal("secure-protect")
    secureProtect.lineItems.head.id shouldEqual 73773447
  }

}
