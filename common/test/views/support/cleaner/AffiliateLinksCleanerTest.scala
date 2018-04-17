package views.support.cleaner
import org.scalatest.{FlatSpec, Matchers}
import views.support.AffiliateLinksCleaner._
import conf.Configuration.affiliatelinks._

class AffiliateLinksCleanerTest extends FlatSpec with Matchers {

  "linkToSkimLink" should "correctly convert a link to a skimlink" in {
    val link = "https://www.piratendating.nl/"
    val pageUrl = "/guardian-pirates/soulmates"
    linkToSkimLink(link, pageUrl) should equal (s"http://go.theguardian.com/?id=$skimlinksId&url=https%3A%2F%2Fwww.piratendating.nl%2F&sref=/guardian-pirates/soulmates")
  }

  "shouldAddAffiliateLinks" should "correctly determine when to add affiliate links" in {
    shouldAddAffiliateLinks(switchedOn = false, "film", None) should be (false)
    shouldAddAffiliateLinks(switchedOn = true, "film", None) should be (true)
    shouldAddAffiliateLinks(switchedOn = true, "film", Some(false)) should be (false)
    shouldAddAffiliateLinks(switchedOn = true, "news", Some(true)) should be (true)

  }
}
