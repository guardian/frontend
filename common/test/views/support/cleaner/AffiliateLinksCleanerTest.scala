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

  "shouldAddAffiliateLinks" should "correctly determine when to add affiliate links" in {

    shouldAddAffiliateLinks(
      switchedOn = false,
      None,
      Set.empty,
      List.empty,
    ) should be(false)
    shouldAddAffiliateLinks(
      switchedOn = true,
      Some(false),
      Set.empty,
      List.empty,
    ) should be(false)
    shouldAddAffiliateLinks(
      switchedOn = true,
      Some(true),
      Set.empty,
      List.empty,
    ) should be(true)
    shouldAddAffiliateLinks(
      switchedOn = true,
      None,
      Set.empty,
      List("tech"),
    ) should be(false)
    shouldAddAffiliateLinks(
      switchedOn = true,
      Some(true),
      Set("bereavement"),
      List("bereavement"),
    ) should be(false)
    shouldAddAffiliateLinks(
      switchedOn = true,
      Some(true),
      Set("bereavement"),
      List("tech"),
    ) should be(true)
  }
}
