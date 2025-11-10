package views.support.cleaner
import conf.Configuration
import org.joda.time.DateTime
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import views.support.AffiliateLinksCleaner._

class AffiliateLinksCleanerTest extends AnyFlatSpec with Matchers {

  "linkToSkimLink" should "correctly convert a link to a skimlink" in {
    val link = "https://www.piratendating.nl/"
    val pageUrl = "/guardian-pirates/soulmates"
    linkToSkimLink(link, pageUrl, "123") should equal(
      s"https://go.skimresources.com/?id=123&url=https%3A%2F%2Fwww.piratendating.nl%2F&sref=${Configuration.site.host}/guardian-pirates/soulmates",
    )
  }

  "linkToSkimLink" should "replace http: with https: in the original link" in {
    val link = "http://www.piratendating.nl/"
    val pageUrl = "/guardian-pirates/soulmates"
    linkToSkimLink(link, pageUrl, "123") should equal(
      s"https://go.skimresources.com/?id=123&url=https%3A%2F%2Fwww.piratendating.nl%2F&sref=${Configuration.site.host}/guardian-pirates/soulmates",
    )
  }

  "shouldAddAffiliateLinks" should "correctly determine when to add affiliate links" in {
    // the switch is respected
    shouldAddAffiliateLinks(
      switchedOn = false,
      None,
      Set.empty,
      List.empty,
    ) should be(false)
    // affiliate links are not added when showAffiliateLinks is false
    shouldAddAffiliateLinks(
      switchedOn = true,
      Some(false),
      Set.empty,
      List.empty,
    ) should be(false)
    // affiliate links are added when showAffiliateLinks is true and there are no alwaysOff tags present
    shouldAddAffiliateLinks(
      switchedOn = true,
      Some(true),
      Set.empty,
      List.empty,
    ) should be(true)
    // affiliate links are not added when showAffiliateLinks is not defined
    shouldAddAffiliateLinks(
      switchedOn = true,
      None,
      Set.empty,
      List("tech"),
    ) should be(false)
    // affiliate links are not added when an always off tag is present on the article
    shouldAddAffiliateLinks(
      switchedOn = true,
      Some(true),
      Set("bereavement"),
      List("bereavement"),
    ) should be(false)
    // affiliate links are added when the tags are considered safe
    shouldAddAffiliateLinks(
      switchedOn = true,
      Some(true),
      Set("bereavement"),
      List("tech"),
    ) should be(true)
  }
}
