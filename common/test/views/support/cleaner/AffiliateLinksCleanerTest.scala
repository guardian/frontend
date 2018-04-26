package views.support.cleaner
import org.scalatest.{FlatSpec, Matchers}
import views.support.AffiliateLinksCleaner._

class AffiliateLinksCleanerTest extends FlatSpec with Matchers {

  "linkToSkimLink" should "correctly convert a link to a skimlink" in {
    val link = "https://www.piratendating.nl/"
    val pageUrl = "/guardian-pirates/soulmates"
    linkToSkimLink(link, pageUrl, "123") should equal (s"http://go.theguardian.com/?id=123&url=https%3A%2F%2Fwww.piratendating.nl%2F&sref=/guardian-pirates/soulmates")
  }

  "shouldAddAffiliateLinks" should "correctly determine when to add affiliate links" in {
    val supportedSections = Set("film", "books")
    shouldAddAffiliateLinks(switchedOn = false, "film", None, supportedSections) should be (false)
    shouldAddAffiliateLinks(switchedOn = true, "film", None, supportedSections) should be (true)
    shouldAddAffiliateLinks(switchedOn = true, "film", Some(false), supportedSections) should be (false)
    shouldAddAffiliateLinks(switchedOn = true, "news", Some(true), supportedSections) should be (true)

  }
}
