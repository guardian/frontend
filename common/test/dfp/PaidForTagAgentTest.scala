package dfp

import com.gu.contentapi.client.model.{Tag => ApiTag}
import com.gu.facia.client.models.CollectionConfigJson
import common.Edition.defaultEdition
import common.editions.Us
import conf.Switches.EditionAwareLogoSlots
import model.Tag
import org.joda.time.DateTime
import org.scalatest.Inspectors._
import org.scalatest.{FlatSpec, Matchers}

import scala.util.Random

class PaidForTagAgentTest extends FlatSpec with Matchers {

  private def toTag(tagType: String, tagId: String, sectionId: Option[String] = None): Tag = {
    Tag(ApiTag(id = tagId,
      `type` = tagType,
      sectionId = sectionId,
      webTitle = "title",
      webUrl = "url",
      apiUrl = "url"))
  }
  private def toKeyword(tagId: String, sectionId: Option[String] = None): Tag = toTag("keyword",
    tagId,
    sectionId)
  private def toSeries(tagId: String, sectionId: Option[String] = None): Tag = toTag("series",
    tagId,
    sectionId)

  private def paidForTag(targetedName: String,
                         paidForType: PaidForType,
                         tagType: TagType,
                         adUnitPaths: Seq[String] = Nil,
                         sponsor: Option[String] = None,
                         expiryDates: Seq[Option[DateTime]] = Seq(None),
                         editionId: Option[String] = None): PaidForTag = {
    val adUnits = adUnitPaths.map(path => GuAdUnit("0", path.split("/")))
    val customTargetSets = editionId map { edition =>
      Seq(CustomTargetSet("AND", Seq(CustomTarget("edition", "IS", Seq(edition)))))
    } getOrElse Nil
    val targeting = GuTargeting(adUnits, Nil, Nil, customTargetSets)
    val lineItems = expiryDates map { expiryDate =>
      GuLineItem(Random.nextInt(),
        "liName",
        DateTime.now(),
        expiryDate,
        isPageSkin = false,
        sponsor,
        "delivering",
        targeting)
    }
    PaidForTag(targetedName, Keyword, paidForType, Nil, lineItems)
  }

  private object TestPaidForTagAgent extends PaidForTagAgent {

    override protected def isPreview: Boolean = false

    val sponsorships: Seq[PaidForTag] = Seq(
      paidForTag("business-essentials", Sponsored, Keyword, sponsor = Some("spon")),
      paidForTag("media", Sponsored, Keyword, editionId = Some("uk")),
      paidForTag("healthyliving",
        Sponsored, Keyword,
        adUnitPaths = Seq("theguardian.com/spinach"),
        sponsor = Some("Squeegee")
      )
    )

    val advertisementFeatureSponsorships: Seq[PaidForTag] = Seq(
      paidForTag("best-awards", AdvertisementFeature, Keyword, sponsor = Some("spon2")),
      paidForTag("film", AdvertisementFeature, Keyword),
      paidForTag("grundfos-partner-zone", AdvertisementFeature, Keyword),
      paidForTag("sustainable-business-grundfos-partner-zone", AdvertisementFeature, Keyword),
      paidForTag("media-network-adobe-partner-zone", AdvertisementFeature, Keyword),
      paidForTag("wsscc-partner-zone", AdvertisementFeature, Keyword,
        adUnitPaths = Seq("theguardian.com",
          "theguardian.com/global-development-professionals-network",
          "theguardian.com/global-development-professionals-network/front")),
      paidForTag("some-partner-zone", AdvertisementFeature, Keyword,
        adUnitPaths = Seq(
          "theguardian.com/global-development-professionals-network",
          "theguardian.com/global-development-professionals-network/front")
      ),
      paidForTag("agencies", AdvertisementFeature, Series),
      paidForTag("tagName",
        AdvertisementFeature,
        Keyword,
        expiryDates = Seq(Some(DateTime.now().minusHours(1)))),
      paidForTag("tagNameMatchingMultipleLineItems",
        AdvertisementFeature,
        Keyword,
        expiryDates = Seq(Some(DateTime.now().minusHours(1)), None)),
      paidForTag("tagNameMatchingMoreMultipleLineItems",
        AdvertisementFeature,
        Keyword,
        expiryDates = Seq(Some(DateTime.now().minusHours(1)), Some(DateTime.now().plusHours(1))))
    )

    val foundationSupported: Seq[PaidForTag] = Seq(
      paidForTag("music", FoundationFunded, Keyword, sponsor = Some("Music Foundation")),
      paidForTag("womens-rights-and-gender-equality-in-focus", FoundationFunded, Keyword),
      paidForTag("global-development", FoundationFunded, Keyword),
      paidForTag("global-modern-day-slavery-in-focus", FoundationFunded, Series)
    )

    val allAdFeatureTags: Seq[PaidForTag] = Seq(
      paidForTag("tagName",
        AdvertisementFeature,
        Keyword,
        expiryDates = Seq(Some(DateTime.now().minusHours(1)))),
      paidForTag("tagNameMatchingMultipleLineItems",
        AdvertisementFeature,
        Keyword,
        expiryDates = Seq(Some(DateTime.now().minusHours(1)), None)),
      paidForTag("tagNameMatchingMoreMultipleLineItems",
        AdvertisementFeature,
        Keyword,
        expiryDates = Seq(Some(DateTime.now().minusHours(1)), Some(DateTime.now().plusHours(1))))
    )

    override protected val currentPaidForTags: Seq[PaidForTag] =
      sponsorships ++ advertisementFeatureSponsorships ++ foundationSupported

    override protected def tagToSponsorsMap: Map[String, Set[String]] = Map.empty

    override protected def tagToAdvertisementFeatureSponsorsMap: Map[String, Set[String]] = Map
      .empty
  }

  private def apiQuery(apiQuery: String) = {
    CollectionConfigJson.withDefaults(apiQuery = Some(apiQuery))
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

  it should "be true if series tag exists" in {
    val tags = Seq(
      toKeyword("culture/article"),
      toSeries("best-awards/best-awards")
    )
    TestPaidForTagAgent.isAdvertisementFeature(tags, maybeSectionId = None) should be(true)
  }

  it should "be true for an advertisement feature container" in {

    val apiQueries = Seq(
      "search?tag=books%2Ffilm&section=money",
      "search?tag=environment%2Fblog%7Cfilm%2Ffilm%2Fguardian-environment-blogs%7Cenvironment" +
        "%2Fgeorgemonbiot%7Cenvironment%2Fdamian-carrington-blog%7books%2Ffilm",
      "search?tag=film%2Ffilm&section=sport&page-size=50",
      "search?tag=books%2Ffilm&section=culture%7Cmusic%7Cgruel%7Cbooks%7Cartanddesign%7Cstage" +
        "%7Ctv-and-radio",
      "search?tag=(tone%2Fanalysis%2C(world%2Fusa%7Cfilm%2Ffilm))%7C(tone%2Fcomment%2C" +
        "(world%2Fusa%7Cbusiness%2Fus-personal-finance))&section=business",
      "search?tag=business/financial-sector|business/manufacturing-sector|business/luxury-goods" +
        "-sector|business" +
        "/fooddrinks|business/theairlineindustry|business/automotive-industry|business/banking" +
        "|business/construction" +
        "|filmo/gruel|business/healthcare|business/insurance|business/mining|business" +
        "/musicindustry|business" +
        "/pharmaceuticals-industry|business/realestate|business/retail|business/technology|film" +
        "/film|business" +
        "/tobacco-industry|business/travelleisure|business/utilities|business/services-sector",
      "film?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "search?tag=world/mongolia|world/afghanistan|books/film|world/bangladesh|world/bhutan|world" +
        "/burma|world" +
        "/kazakhstan|world/kyrgyzstan|world/india|world/maldives|world/nepal|world/pakistan|world" +
        "/srilanka|world" +
        "/tajikistan|world/turkmenistan|world/uzbekistan|world/brunei|world/cambodia|world/china" +
        "|world/indonesia|world" +
        "/japan|world/laos|world/mongolia|world/malaysia|world/north-korea|world/philippines" +
        "|world/singapore|world" +
        "/south-korea|world/taiwan|world/thailand|world/vietnam|world/timor-leste|world/tibet",
      "books/film",
      "books/film?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "film?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "books/film?edition=au",
      "film"
    )

    forEvery(apiQueries) { q =>
      TestPaidForTagAgent.isAdvertisementFeature(apiQuery(q)) should be(true)
    }
  }

  it should "be true for a partner zone container" in {

    val apiQueries = Seq("media-network/adobe-partner-zone")

    forEvery(apiQueries) { q =>
      TestPaidForTagAgent.isAdvertisementFeature(apiQuery(q)) should be(true)
    }
  }

  it should "be false for a non advertisement feature container" in {

    val apiQueries = Seq(
      "search?tag=type%2Fvideo&section=money",
      "search?tag=environment%2Fblog%7Cenvironment%2Fseries%2Fguardian-environment-blogs" +
        "%7Cenvironment" +
        "%2Fgeorgemonbiot%7Cenvironment%2Fdamian-carrington-blog%7Cenvironment%2Fbike-blog",
      "search?tag=type%2Fgallery&section=sport&page-size=50",
      "search?tag=tone%2Freviews&section=culture%7Cmusic%7Cculture%7Cbooks%7Cartanddesign%7Cstage" +
        "%7Ctv-and-radio",
      "search?tag=(tone%2Fanalysis%2C(world%2Fusa%7Cbusiness%2Fus-personal-finance))%7C" +
        "(tone%2Fcomment%2C" +
        "(world%2Fusa%7Cbusiness%2Fus-personal-finance))&section=business",
      "search?tag=business/financial-sector|business/manufacturing-sector|business/luxury-goods" +
        "-sector|business" +
        "/fooddrinks|business/theairlineindustry|business/automotive-industry|business/banking" +
        "|business/construction" +
        "|film/film-industry|business/healthcare|business/insurance|business/mining|business" +
        "/musicindustry|business" +
        "/pharmaceuticals-industry|business/realestate|business/retail|business/technology" +
        "|business/telecoms|business" +
        "/tobacco-industry|business/travelleisure|business/utilities|business/services-sector",
      "technology?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "search?tag=world/mongolia|world/afghanistan|world/azerbaijan|world/bangladesh|world/bhutan" +
        "|world/burma|world" +
        "/kazakhstan|world/kyrgyzstan|world/india|world/maldives|world/nepal|world/pakistan|world" +
        "/srilanka|world" +
        "/tajikistan|world/turkmenistan|world/uzbekistan|world/brunei|world/cambodia|world/china" +
        "|world/indonesia|world" +
        "/japan|world/laos|world/mongolia|world/malaysia|world/north-korea|world/philippines" +
        "|world/singapore|world" +
        "/south-korea|world/taiwan|world/thailand|world/vietnam|world/timor-leste|world/tibet",
      "news/special",
      "uk/money?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "au?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "sport/motorsports?edition=au",
      "environment"
    )

    forEvery(apiQueries) { q =>
      TestPaidForTagAgent.isAdvertisementFeature(apiQuery(q)) should be(false)
    }
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

  it should "be true if series is ad-feature sponsored" in {
    val tags = Seq(toKeyword("global-development/global-development"),
      toKeyword("culture/film"), toSeries("media-network/series/agencies"))
    TestPaidForTagAgent.isAdvertisementFeature(tags, maybeSectionId = Some("culture")) should be(true)
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
    EditionAwareLogoSlots.switchOn()
    TestPaidForTagAgent.isSponsored(tags,
      maybeSectionId = Some("spinach"),
      maybeEdition = Some(defaultEdition)
    ) should be(true)
  }

  it should "be false if sponsorship is for another edition" in {
    val tags = Seq(toKeyword("culture/media"))
    EditionAwareLogoSlots.switchOn()
    TestPaidForTagAgent.isSponsored(tags,
      maybeSectionId = None,
      maybeEdition = Some(Us)
    ) should be(false)
  }

  it should "be true for a sponsored container" in {

    val apiQueries = Seq(
      "search?tag=books%2Fmedia&section=money",
      "search?tag=environment%2Fblog%7Cmedia%2Fmedia%2Fguardian-environment-blogs%7Cenvironment" +
        "%2Fgeorgemonbiot%7Cenvironment%2Fdamian-carrington-blog%7books%2Fmedia",
      "search?tag=media%2Fmedia&section=sport&page-size=50",
      "search?tag=books%2Fgruel&section=culture%7Cmedia%7Cmusic%7Cbooks%7Cartanddesign%7Cstage" +
        "%7Ctv-and-radio",
      "search?tag=(tone%2Fanalysis%2C(world%2Fusa%7Cmedia%2Fmedia))%7C(tone%2Fcomment%2C" +
        "(world%2Fusa%7Cbusiness%2Fus-personal-finance))&section=business",
      "search?tag=business/financial-sector|business/manufacturing-sector|business/luxury-goods" +
        "-sector|business" +
        "/fooddrinks|business/theairlineindustry|business/automotive-industry|business/banking" +
        "|business/construction" +
        "|mediao/gruel|business/healthcare|business/insurance|business/mining|business" +
        "/musicindustry|business" +
        "/pharmaceuticals-industry|business/realestate|business/retail|business/technology|media" +
        "/media|business" +
        "/tobacco-industry|business/travelleisure|business/utilities|business/services-sector",
      "media?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "search?tag=world/mongolia|world/afghanistan|books/media|world/bangladesh|world/bhutan" +
        "|world/burma|world" +
        "/kazakhstan|world/kyrgyzstan|world/india|world/maldives|world/nepal|world/pakistan|world" +
        "/srilanka|world" +
        "/tajikistan|world/turkmenistan|world/uzbekistan|world/brunei|world/cambodia|world/china" +
        "|world/indonesia|world" +
        "/japan|world/laos|world/mongolia|world/malaysia|world/north-korea|world/philippines" +
        "|world/singapore|world" +
        "/south-korea|world/taiwan|world/thailand|world/vietnam|world/timor-leste|world/tibet",
      "books/media",
      "books/media?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "media?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "books/media?edition=au",
      "media"
    )

    forEvery(apiQueries) { q =>
      TestPaidForTagAgent.isSponsored(apiQuery(q)) should be(true)
    }
  }

  it should "be false for a non sponsored container" in {

    val apiQueries = Seq(
      "search?tag=type%2Fvideo&section=money",
      "search?tag=environment%2Fblog%7Cenvironment%2Fseries%2Fguardian-environment-blogs" +
        "%7Cenvironment" +
        "%2Fgeorgemonbiot%7Cenvironment%2Fdamian-carrington-blog%7Cenvironment%2Fbike-blog",
      "search?tag=type%2Fgallery&section=sport&page-size=50",
      "search?tag=tone%2Freviews&section=culture%7Cmusic%7Cculture%7Cbooks%7Cartanddesign%7Cstage" +
        "%7Ctv-and-radio",
      "search?tag=(tone%2Fanalysis%2C(world%2Fusa%7Cbusiness%2Fus-personal-finance))%7C" +
        "(tone%2Fcomment%2C" +
        "(world%2Fusa%7Cbusiness%2Fus-personal-finance))&section=business",
      "search?tag=business/financial-sector|business/manufacturing-sector|business/luxury-goods" +
        "-sector|business" +
        "/fooddrinks|business/theairlineindustry|business/automotive-industry|business/banking" +
        "|business/construction" +
        "|film/film-industry|business/healthcare|business/insurance|business/mining|business" +
        "/musicindustry|business" +
        "/pharmaceuticals-industry|business/realestate|business/retail|business/technology" +
        "|business/telecoms|business" +
        "/tobacco-industry|business/travelleisure|business/utilities|business/services-sector",
      "technology?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "search?tag=world/mongolia|world/afghanistan|world/azerbaijan|world/bangladesh|world/bhutan" +
        "|world/burma|world" +
        "/kazakhstan|world/kyrgyzstan|world/india|world/maldives|world/nepal|world/pakistan|world" +
        "/srilanka|world" +
        "/tajikistan|world/turkmenistan|world/uzbekistan|world/brunei|world/cambodia|world/china" +
        "|world/indonesia|world" +
        "/japan|world/laos|world/mongolia|world/malaysia|world/north-korea|world/philippines" +
        "|world/singapore|world" +
        "/south-korea|world/taiwan|world/thailand|world/vietnam|world/timor-leste|world/tibet",
      "news/special",
      "uk/money?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "au?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "sport/motorsports?edition=au",
      "environment"
    )

    forEvery(apiQueries) { q =>
      TestPaidForTagAgent.isSponsored(apiQuery(q)) should be(false)
    }
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

  it should "be true for a container with multiple foundation-targeted keywords" in {
    val q =
      "search?tag=global-development/series/womens-rights-and-gender-equality-in-focus|" +
        "(world/gender,global-development/global-development)"
    TestPaidForTagAgent.isFoundationSupported(apiQuery(q)) should be(true)
  }

  it should "be true for a container with multiple foundation-targeted series and keywords" in {
    val q =
      "search?tag=global-development/series/womens-rights-and-gender-equality-in-focus|" +
        "(world/gender,global-development/global-development,modern-day-slavery-in-focus)"
    TestPaidForTagAgent.isFoundationSupported(apiQuery(q)) should be(true)
  }

  it should "be true for a container with a single foundation-targeted keyword or series" in {
    val q =
      "search?tag=global-development/series/womens-rights-and-gender-equality-in-focus"
    TestPaidForTagAgent.isFoundationSupported(apiQuery(q)) should be(true)
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
      paidForTag("universityguide", Sponsored, Keyword, sponsor = Some("University Sponsor A")),
      paidForTag("university A", Sponsored, Keyword, sponsor = Some("University Sponsor A")),
      paidForTag("universityguide", Sponsored, Keyword, sponsor = Some("University Sponsor B"))
    )

    val sponsorsMap: Map[String, Set[String]] = DfpAgent.generateTagToSponsorsMap(
      universitySponsorships)
    sponsorsMap should contain key "universityguide"
    sponsorsMap("universityguide") should equal(Set("University Sponsor A", "University Sponsor B"))
    sponsorsMap("university A") should equal(Set("University Sponsor A"))

  }

  it should "not bother with tag with no detected sponsors" in {
    val sponsorshipsWithANone = Seq(
      paidForTag("universityguide", Sponsored, Keyword, sponsor = Some("University Sponsor A")),
      paidForTag("videogames", Sponsored, Keyword)
    )

    val sponsorsMap: Map[String, Set[String]] = DfpAgent.generateTagToSponsorsMap(
      sponsorshipsWithANone)
    sponsorsMap should contain key "universityguide"
    sponsorsMap("universityguide") should equal(Set("University Sponsor A"))
    sponsorsMap should not contain key("videogames")
  }

  "isExpiredAdvertisementFeature" should "be true for an expired ad feature" in {
    val keyword = toKeyword("section/tagName")
    TestPaidForTagAgent.isExpiredAdvertisementFeature(Seq(keyword),None) should be(true)
  }

  it should "be false for an ad feature with multiple line items where one has no end date" in {
    val keyword = toKeyword("section/tagNameMatchingMultipleLineItems")
    TestPaidForTagAgent.isExpiredAdvertisementFeature(Seq(keyword), None) should be(false)
  }

  it should "be false for an ad feature with multiple line items where one has not expired" in {
    val keyword = toKeyword("section/tagNameMatchingMoreMultipleLineItems")
    TestPaidForTagAgent.isExpiredAdvertisementFeature(Seq(keyword), None) should be(false)
  }

  it should "be false for an un-paid-for page" in {
    val keyword = toKeyword("anotherSection/someOtherUnrelatedTagName")
    TestPaidForTagAgent.isExpiredAdvertisementFeature(Seq(keyword), None) should be(false)
  }
}
