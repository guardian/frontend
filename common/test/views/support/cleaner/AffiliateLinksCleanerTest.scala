package views.support.cleaner
import org.joda.time.DateTime
import org.scalatest.{FlatSpec, Matchers}
import views.support.AffiliateLinksCleaner._

class AffiliateLinksCleanerTest extends FlatSpec with Matchers {

  "linkToSkimLink" should "correctly convert a link to a skimlink" in {
    val link = "https://www.piratendating.nl/"
    val pageUrl = "/guardian-pirates/soulmates"
    linkToSkimLink(link, pageUrl, "123") should equal (s"http://go.theguardian.com/?id=123&url=https%3A%2F%2Fwww.piratendating.nl%2F&sref=/guardian-pirates/soulmates")
  }

  "shouldAddAffiliateLinks" should "correctly determine when to add affiliate links" in {
    val supportedSections = Set("film", "books", "fashion")
    val oldPublishedDate = Some(new DateTime(2020, 8, 13, 0, 0))
    val newPublishedDate = Some(new DateTime(2020, 8, 15, 0, 0))

    shouldAddAffiliateLinks(switchedOn = false, "film", None, supportedSections, Set.empty, Set.empty, List.empty, oldPublishedDate) should be (false)
    shouldAddAffiliateLinks(switchedOn = true, "film", None, supportedSections, Set.empty, Set.empty, List.empty, oldPublishedDate) should be (true)
    shouldAddAffiliateLinks(switchedOn = true, "film", Some(false), supportedSections, Set.empty, Set.empty, List.empty, oldPublishedDate) should be (false)
    shouldAddAffiliateLinks(switchedOn = true, "news", Some(true), supportedSections, Set.empty, Set.empty, List.empty, oldPublishedDate) should be (true)
    shouldAddAffiliateLinks(switchedOn = true, "news", None, supportedSections, Set("bereavement"), Set.empty, List("bereavement"), oldPublishedDate) should be (false)
    shouldAddAffiliateLinks(switchedOn = true, "news", None, supportedSections, Set("bereavement"), Set.empty, List("tech"), oldPublishedDate) should be (false)
    shouldAddAffiliateLinks(switchedOn = true, "fashion", None, supportedSections, Set("bereavement"), Set.empty, List("tech"), oldPublishedDate) should be (true)
    shouldAddAffiliateLinks(switchedOn = true, "fashion", Some(true), supportedSections, Set.empty, Set("bereavement"), List("bereavement"), oldPublishedDate) should be (false)
    shouldAddAffiliateLinks(switchedOn = true, "fashion", Some(true), supportedSections, Set.empty, Set("bereavement"), List("tech"), oldPublishedDate) should be (true)
    shouldAddAffiliateLinks(switchedOn = true, "fashion", Some(true), supportedSections, Set.empty, Set("bereavement"), List("tech"), newPublishedDate) should be (false)
  }
}
