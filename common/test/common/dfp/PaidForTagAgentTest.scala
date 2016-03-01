package common.dfp

import com.gu.contentapi.client.model.v1.{Tag => ApiTag, TagType => ApiTagType}
import common.Edition.defaultEdition
import common.editions.Us
import model.Tag
import org.joda.time.DateTime
import org.scalatest.{FlatSpec, Matchers}

import scala.util.Random

class PaidForTagAgentTest extends FlatSpec with Matchers {

  private def toTag(tagType: ApiTagType, tagId: String, sectionId: Option[String] = None): Tag = {
    Tag.make(ApiTag(id = tagId,
      `type` = tagType,
      sectionId = sectionId,
      webTitle = "title",
      webUrl = "url",
      apiUrl = "url"))
  }
  private def toKeyword(tagId: String, sectionId: Option[String] = None): Tag =
    toTag(ApiTagType.Keyword, tagId, sectionId)
  private def toSeries(tagId: String, sectionId: Option[String] = None): Tag =
    toTag(ApiTagType.Series, tagId, sectionId)

  private def toLineItem(state: String = "DELIVERING",
                         editionId: Option[String] = None,
                         sponsor: Option[String] = None,
                         expiryDate: Option[DateTime] = None,
                         adUnitPaths: Seq[String] = Nil) = {
    val adUnits = adUnitPaths.map(path => GuAdUnit("0", path.split("/")))
    val customTargetSets = editionId map { edition =>
      Seq(CustomTargetSet("AND", Seq(CustomTarget("edition", "IS", Seq(edition)))))
    } getOrElse Nil
    GuLineItem(
      Random.nextInt(),
      "liName",
      DateTime.now(),
      expiryDate,
      isPageSkin = false,
      sponsor,
      state,
      "CPM",
      Nil,
      GuTargeting(adUnits, Nil, Nil, customTargetSets),
      DateTime.now()
    )
  }

  private def paidForTag(targetedName: String,
                         paidForType: PaidForType,
                         tagType: TagType,
                         lineItems: GuLineItem*): PaidForTag = {
    PaidForTag(targetedName, Keyword, paidForType, Nil, lineItems)
  }

  private object TestPaidForTagAgent extends PaidForTagAgent {

    override protected def isPreview: Boolean = false

    val sponsorships: Seq[PaidForTag] = Seq(
      paidForTag("business-essentials", Sponsored, Keyword, toLineItem(sponsor = Some("spon"))),
      paidForTag("media", Sponsored, Keyword, toLineItem(editionId = Some("uk"))),
      paidForTag("healthyliving",
        Sponsored, Keyword,
        toLineItem(adUnitPaths = Seq("theguardian.com/spinach"),
          sponsor = Some("Squeegee"))
      ),
      paidForTag(
        targetedName = "sixnations",
        paidForType = Sponsored,
        tagType = Keyword
      ),
      paidForTag("sustainable-business/series/food",
        Sponsored,
        Series,
        toLineItem(sponsor = Some("spon")))
    )

    val advertisementFeatureSponsorships: Seq[PaidForTag] = Seq(
      paidForTag("best-awards", AdvertisementFeature, Keyword, toLineItem(sponsor = Some("spon2"))),
      paidForTag("film", AdvertisementFeature, Keyword),
      paidForTag("grundfos-partner-zone", AdvertisementFeature, Keyword),
      paidForTag("sustainable-business-grundfos-partner-zone", AdvertisementFeature, Keyword),
      paidForTag("media-network-adobe-partner-zone", AdvertisementFeature, Keyword),
      paidForTag("wsscc-partner-zone", AdvertisementFeature, Keyword,
        toLineItem(adUnitPaths = Seq("theguardian.com",
          "theguardian.com/global-development-professionals-network",
          "theguardian.com/global-development-professionals-network/front"))),
      paidForTag("some-partner-zone", AdvertisementFeature, Keyword,
        toLineItem(adUnitPaths = Seq(
          "theguardian.com/global-development-professionals-network",
          "theguardian.com/global-development-professionals-network/front"))
      ),
      paidForTag("agencies", AdvertisementFeature, Series),
      paidForTag("tagName",
        AdvertisementFeature,
        Keyword,
        toLineItem(expiryDate = Some(DateTime.now().minusHours(1)))),
      paidForTag("tagNameMatchingMultipleLineItems",
        AdvertisementFeature,
        Keyword,
        toLineItem(expiryDate = Some(DateTime.now().minusHours(1))),
        toLineItem(expiryDate = None)),
      paidForTag("tagNameMatchingMoreMultipleLineItems",
        AdvertisementFeature,
        Keyword,
        toLineItem(expiryDate = Some(DateTime.now().minusHours(1))),
        toLineItem(expiryDate = Some(DateTime.now().plusHours(1))))
    )

    val foundationSupported: Seq[PaidForTag] = Seq(
      paidForTag("music",
        FoundationFunded,
        Keyword,
        toLineItem(sponsor = Some("Music Foundation"))),
      paidForTag("womens-rights-and-gender-equality-in-focus", FoundationFunded, Keyword),
      paidForTag("global-development", FoundationFunded, Keyword),
      paidForTag("global-modern-day-slavery-in-focus", FoundationFunded, Series)
    )

    val allAdFeatureTags: Seq[PaidForTag] = Seq(
      paidForTag("tagName",
        AdvertisementFeature,
        Keyword,
        toLineItem(expiryDate = Some(DateTime.now().minusHours(1)))),
      paidForTag("tagNameMatchingMultipleLineItems",
        AdvertisementFeature,
        Keyword,
        toLineItem(expiryDate = Some(DateTime.now().minusHours(1))),
        toLineItem(expiryDate = None)),
      paidForTag("tagNameMatchingMoreMultipleLineItems",
        AdvertisementFeature,
        Keyword,
        toLineItem(expiryDate = Some(DateTime.now().minusHours(1))),
        toLineItem(expiryDate = Some(DateTime.now().plusHours(1)))),
      paidForTag("tagNameMatchingPausedTag",
        AdvertisementFeature,
        Keyword,
        toLineItem(state = "PAUSED", expiryDate = Some(DateTime.now().plusHours(1))))
    )

    override protected val currentPaidForTags: Seq[PaidForTag] =
      sponsorships ++ advertisementFeatureSponsorships ++ foundationSupported

    override protected def tagToSponsorsMap: Map[String, Set[String]] = Map.empty

    override protected def tagToAdvertisementFeatureSponsorsMap: Map[String, Set[String]] = Map
      .empty
  }

  "isAdvertisementFeature" should "be true for an advertisement feature" in {
    TestPaidForTagAgent.isAdvertisementFeature("advert/best-awards/best-awards",
      maybeSectionId = None
    ) should be(true)
  }

  it should "be true if keyword tag exists" in {
    val tags = Seq(
      toKeyword("culture/article"),
      toKeyword("best-awards/best-awards")
    )
    TestPaidForTagAgent.isAdvertisementFeature(tags, maybeSectionId = None) should be(true)
  }

  it should "be false for a non advertisement feature" in {
    TestPaidForTagAgent.isAdvertisementFeature("culture/article",
      maybeSectionId = None
    ) should be(false)
  }

  it should "be false if series tag does not exist but an unsponsored keyword tag has same name" in {
    val tags = Seq(
      toKeyword("culture/article"),
      toSeries("best-awards/best-awards")
    )
    TestPaidForTagAgent.isAdvertisementFeature(tags, maybeSectionId = None) should be(false)
  }

  it should "be true for front of an ad feature section with a multi-part section name" in {
    TestPaidForTagAgent.isAdvertisementFeature(
      capiTagId = "sustainable-business-grundfos-partner-zone/sustainable-business-grundfos-partner" +
        "-zone",
      maybeSectionId = Some("sustainable-business/grundfos-partner-zone")
    ) should be(true)
  }

  it should "be true for an article in an ad feature section with a multi-part section name" in {
    TestPaidForTagAgent.isAdvertisementFeature(
      "sustainable-business-grundfos-partner-zone/sustainable-business-grundfos-partner-zone",
      maybeSectionId = Some("sustainable-business/grundfos-partner-zone")
    ) should be(true)
  }

  it should "be true for an article where the corresponding logo targets the entire site and some" +
    " special ad units" in {
    TestPaidForTagAgent.isAdvertisementFeature(
      capiTagId = "wsscc-partner-zone/wsscc-partner-zone",
      maybeSectionId = Some("arbitrary section")
    ) should be(true)
  }

  it should "be false for an article where the corresponding logo only targets some special ad " +
    "units" in {
    TestPaidForTagAgent.isAdvertisementFeature(
      capiTagId = "some-partner-zone/some-partner-zone",
      maybeSectionId = Some("arbitrary section")
    ) should be(false)
  }

  it should "be true if primary keyword is ad-feature sponsored" in {
    val tags = Seq(toKeyword("culture/film"),
      toKeyword("culture/healthyliving"),
      toKeyword("culture/culture"))
    TestPaidForTagAgent.isAdvertisementFeature(tags, maybeSectionId = Some("culture")) should be(true)
  }

  it should "be false if primary keyword is ad-feature sponsored" in {
    val tags = Seq(toKeyword("culture/healthyliving"),
      toKeyword("global-development/global-development"),
      toKeyword("culture/film"))
    TestPaidForTagAgent.isAdvertisementFeature(tags, maybeSectionId = Some("culture")) should be(false)
  }

  it should "be false if series is not ad-feature sponsored but an unsponsored keyword has same name" in {
    val tags = Seq(
      toKeyword("global-development/global-development"),
      toKeyword("culture/film"),
      toSeries("media-network/series/agencies")
    )
    TestPaidForTagAgent.isAdvertisementFeature(tags, maybeSectionId = Some("culture")) should be(
      false)
  }

  "isSponsored" should "be true for a sponsored article" in {
    TestPaidForTagAgent.isSponsored("small-business-network/business-essentials",
      maybeSectionId = None,
      maybeEdition = Some(defaultEdition)
    ) should be(true)
  }

  it should "be true if section tag exists" in {
    val tags = Seq(toKeyword("media/media"))
    TestPaidForTagAgent.isSponsored(tags, maybeSectionId = None) should be(true)
  }

  it should "be true if series exists" in {
    val tags = Seq(toSeries("foo/spon"))
    TestPaidForTagAgent.isSponsored(tags, maybeSectionId = None) should be(false)
  }

  it should "be false for an unsponsored article" in {
    TestPaidForTagAgent.isSponsored("article",
      maybeSectionId = None,
      maybeEdition = None) should be(false)
  }

  it should "be false for unsponsored tags" in {
    val tags = Seq(toKeyword("culture/books"))
    TestPaidForTagAgent.isSponsored(tags, maybeSectionId = None) should be(false)
  }

  it should "be true for a sponsored tag and section combination" in {
    val tags = Seq(toKeyword("spinach/healthyliving", Some("spinach")))
    TestPaidForTagAgent.isSponsored(tags, maybeSectionId = Some("spinach")) should be(true)
  }

  it should "be false for an unsponsored tag and section combination" in {
    val tags = Seq(toKeyword("culture/healthyliving", Some("culture")))
    TestPaidForTagAgent.isSponsored(tags, maybeSectionId = Some("culture")) should be(false)
  }

  it should "be true if primary keyword is sponsored" in {
    val tags = Seq(toKeyword("culture/healthyliving"), toKeyword("culture/culture"))
    TestPaidForTagAgent.isSponsored(tags, maybeSectionId = Some("spinach")) should be(true)
  }

  it should "be false if primary keyword is foundation-funded" in {
    val tags = Seq(toKeyword("global-development/global-development"),
      toKeyword("culture/healthyliving"))
    TestPaidForTagAgent.isSponsored(tags, maybeSectionId = Some("culture")) should be(false)
  }

  it should "be true if sponsorship is not for a particular edition" in {
    val tags = Seq(toKeyword("culture/healthyliving"))
    TestPaidForTagAgent.isSponsored(tags,
      maybeSectionId = Some("spinach"),
      maybeEdition = Some(defaultEdition)
    ) should be(true)
  }

  it should "be false if sponsorship is for another edition" in {
    val tags = Seq(toKeyword("culture/media"))
    TestPaidForTagAgent.isSponsored(tags,
      maybeSectionId = None,
      maybeEdition = Some(Us)
    ) should be(false)
  }

  it should "be false if there is a sponsored series and an unsponsored keyword with the same suffix, " +
    "and the page has the keyword but not the series" in {
    val tags = Seq(toKeyword("environment/food"))
    TestPaidForTagAgent.isSponsored(tags, maybeSectionId = None) should be(false)
  }

  "isFoundationSupported" should "be true for a foundation-supported page" in {
    TestPaidForTagAgent.isFoundationSupported("global-development/global-development",
      maybeSectionId = None
    ) should be(true)
  }

  it should "be false for a non foundation-supported page" in {
    TestPaidForTagAgent.isFoundationSupported("guffaw",
      maybeSectionId = None
    ) should be(false)
  }

  "getSponsor" should "have some value for a sponsored tag with a specified sponsor" in {
    TestPaidForTagAgent.getSponsor("small-business-network/business-essentials") should be(Some(
      "spon"))
  }

  it should "have some value for an advertisement feature tag with a specified sponsor" in {
    TestPaidForTagAgent.getSponsor("best-awards/best-awards") should be(Some("spon2"))
  }

  it should "have no value for an advertisement feature tag without a specified sponsor" in {
    TestPaidForTagAgent.getSponsor("film") should be(None)
  }

  it should "have no value for an unsponsored tag" in {
    TestPaidForTagAgent.getSponsor("culture") should be(None)
  }

  "generate tag to sponsors map" should "glom sponsorships together" in {
    val universitySponsorships = Seq(
      paidForTag("universityguide",
        Sponsored,
        Keyword,
        toLineItem(sponsor = Some("University Sponsor A"))),
      paidForTag("university A",
        Sponsored,
        Keyword,
        toLineItem(sponsor = Some("University Sponsor A"))),
      paidForTag("universityguide",
        Sponsored,
        Keyword,
        toLineItem(sponsor = Some("University Sponsor B")))
    )

    val sponsorsMap: Map[String, Set[String]] = DfpAgent.generateTagToSponsorsMap(
      universitySponsorships)
    sponsorsMap should contain key "universityguide"
    sponsorsMap("universityguide") should equal(Set("University Sponsor A", "University Sponsor B"))
    sponsorsMap("university A") should equal(Set("University Sponsor A"))

  }

  it should "not bother with tag with no detected sponsors" in {
    val sponsorshipsWithANone = Seq(
      paidForTag("universityguide",
        Sponsored,
        Keyword,
        toLineItem(sponsor = Some("University Sponsor A"))),
      paidForTag("videogames", Sponsored, Keyword)
    )

    val sponsorsMap: Map[String, Set[String]] = DfpAgent.generateTagToSponsorsMap(
      sponsorshipsWithANone)
    sponsorsMap should contain key "universityguide"
    sponsorsMap("universityguide") should equal(Set("University Sponsor A"))
    sponsorsMap should not contain key("videogames")
  }
}
