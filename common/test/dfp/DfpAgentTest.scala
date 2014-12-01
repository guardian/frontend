package dfp

import com.gu.contentapi.client.model.{Tag => ApiTag}
import com.gu.facia.client.models.CollectionConfig
import common.Edition.defaultEdition
import common.editions.{Au, Uk, Us}
import conf.Configuration.commercial.dfpAdUnitRoot
import model.Tag
import org.scalatest.Inspectors._
import org.scalatest.{FlatSpec, Matchers}


class DfpAgentTest extends FlatSpec with Matchers {

  val examplePageSponsorships = Seq(
    PageSkinSponsorship("lineItemName",
      1234L,
      Seq(s"$dfpAdUnitRoot/business/front"),
      Seq(Uk),
      Seq("United Kingdom"),
      isR2Only = false,
      targetsAdTest = false),
    PageSkinSponsorship("lineItemName2",
      12345L,
      Seq(s"$dfpAdUnitRoot/music/front"),
      Nil,
      Nil,
      isR2Only = false,
      targetsAdTest = false),
    PageSkinSponsorship("lineItemName3",
      123456L,
      Seq(s"$dfpAdUnitRoot/sport"),
      Nil,
      Nil,
      isR2Only = false,
      targetsAdTest = false),
    PageSkinSponsorship("lineItemName4",
      1234567L,
      Seq(s"$dfpAdUnitRoot/testSport/front"),
      Seq(Uk),
      Seq("United Kingdom"),
      isR2Only = false,
      targetsAdTest = true)
  )

  private def toTag(tagType: String, tagId: String, sectionId: Option[String] = None): Tag = {
    Tag(ApiTag(id = tagId, `type` = tagType, sectionId = sectionId, webTitle = "title", webUrl = "url", apiUrl = "url"))
  }
  private def toKeyword(tagId: String, sectionId: Option[String] = None): Tag = toTag("keyword", tagId, sectionId)
  private def toSeries(tagId: String, sectionId: Option[String] = None): Tag = toTag("series", tagId, sectionId)

  private object testDfpAgent extends DfpAgent {
    override protected def sponsorships: Seq[Sponsorship] = Seq(
      Sponsorship(Seq("spon-page"), sections = Nil, Some("spon"), Nil, 1),
      Sponsorship(Seq("media"), sections = Nil, None, Nil, 2),
      Sponsorship(Seq("healthyliving"), sections = Seq("spinach"), Some("Squeegee"), Nil, 3)
    )

    override protected def advertisementFeatureSponsorships: Seq[Sponsorship] = Seq(
      Sponsorship(Seq("ad-feature"), sections = Nil, Some("spon2"), Nil, 4),
      Sponsorship(Seq("film"), sections = Nil, None, Nil, 5),
      Sponsorship(Seq("grundfos-partner-zone", "sustainable-business-grundfos-partner-zone"),
        sections = Seq("sustainable-business"), None, Nil, 8),
      Sponsorship(Seq("media-network-adobe-partner-zone"), sections = Nil, None, Nil, 9)
    )

    override protected def foundationSupported: Seq[Sponsorship] = Seq(
      Sponsorship(Seq("music"), sections = Nil, Some("Music Foundation"), Nil, 6),
      Sponsorship(Seq("chuckle"), sections = Nil, None, Nil, 7),
      Sponsorship(Seq("womens-rights-and-gender-equality-in-focus"), sections = Nil, None, Nil, 10),
      Sponsorship(Seq("global-development"), sections = Nil, None, Nil, 11)
    )

    override protected def pageSkinSponsorships: Seq[PageSkinSponsorship] = examplePageSponsorships

    override protected def inlineMerchandisingTargetedTags: InlineMerchandisingTagSet =
      InlineMerchandisingTagSet(keywords = Set("ad-feature", "film"))

    override def isProd = true

    override protected def tagToSponsorsMap: Map[String, Set[String]] = Map.empty

    override protected def tagToAdvertisementFeatureSponsorsMap: Map[String, Set[String]] = Map.empty
  }

  private object notProductionTestDfpAgent extends DfpAgent {
    override def isProd = false

    override protected def sponsorships: Seq[Sponsorship] = Nil

    override protected def advertisementFeatureSponsorships: Seq[Sponsorship] = Nil

    override protected def foundationSupported: Seq[Sponsorship] = Nil

    override protected def pageSkinSponsorships: Seq[PageSkinSponsorship] = examplePageSponsorships

    override protected def inlineMerchandisingTargetedTags: InlineMerchandisingTagSet = InlineMerchandisingTagSet()


    override protected def tagToSponsorsMap: Map[String, Set[String]] = Map.empty

    override protected def tagToAdvertisementFeatureSponsorsMap: Map[String, Set[String]] = Map.empty
  }

  def apiQuery(apiQuery: String) = {
    CollectionConfig.withDefaults(apiQuery = Some(apiQuery))
  }

  "isAdvertisementFeature" should "be true for an advertisement feature" in {
    testDfpAgent.isAdvertisementFeature("advert/ad-feature", None) should be(true)
  }

  it should "be true if keyword tag exists" in {
    val tags = Seq(
      toKeyword("culture/article"),
      toKeyword("advert/ad-feature")
    )
    testDfpAgent.isAdvertisementFeature(tags, sectionId = None) should be(true)
  }

  it should "be false for a non advertisement feature" in {
    testDfpAgent.isAdvertisementFeature("culture/article", None) should be(false)
  }

  it should "be true if series tag exists" in {
    val tags = Seq(
      toKeyword("culture/article"),
      toSeries("advert/ad-feature")
    )
    testDfpAgent.isAdvertisementFeature(tags, sectionId = None) should be(true)
  }

  it should "be true for an advertisement feature container" in {

    val apiQueries = Seq(
      "search?tag=books%2Ffilm&section=money",
      "search?tag=environment%2Fblog%7Cfilm%2Ffilm%2Fguardian-environment-blogs%7Cenvironment" +
        "%2Fgeorgemonbiot%7Cenvironment%2Fdamian-carrington-blog%7books%2Ffilm",
      "search?tag=film%2Ffilm&section=sport&page-size=50",
      "search?tag=books%2Ffilm&section=culture%7Cmusic%7Cgruel%7Cbooks%7Cartanddesign%7Cstage%7Ctv-and-radio",
      "search?tag=(tone%2Fanalysis%2C(world%2Fusa%7Cfilm%2Ffilm))%7C(tone%2Fcomment%2C" +
        "(world%2Fusa%7Cbusiness%2Fus-personal-finance))&section=business",
      "search?tag=business/financial-sector|business/manufacturing-sector|business/luxury-goods-sector|business" +
        "/fooddrinks|business/theairlineindustry|business/automotive-industry|business/banking|business/construction" +
        "|filmo/gruel|business/healthcare|business/insurance|business/mining|business/musicindustry|business" +
        "/pharmaceuticals-industry|business/realestate|business/retail|business/technology|film/film|business" +
        "/tobacco-industry|business/travelleisure|business/utilities|business/services-sector",
      "film?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "search?tag=world/mongolia|world/afghanistan|books/film|world/bangladesh|world/bhutan|world/burma|world" +
        "/kazakhstan|world/kyrgyzstan|world/india|world/maldives|world/nepal|world/pakistan|world/srilanka|world" +
        "/tajikistan|world/turkmenistan|world/uzbekistan|world/brunei|world/cambodia|world/china|world/indonesia|world" +
        "/japan|world/laos|world/mongolia|world/malaysia|world/north-korea|world/philippines|world/singapore|world" +
        "/south-korea|world/taiwan|world/thailand|world/vietnam|world/timor-leste|world/tibet",
      "books/film",
      "books/film?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "film?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "books/film?edition=au",
      "film"
    )

    forEvery(apiQueries) { q =>
      testDfpAgent.isAdvertisementFeature(apiQuery(q)) should be(true)
    }
  }

  it should "be true for a partner zone container" in {

    val apiQueries = Seq("media-network/adobe-partner-zone")

    forEvery(apiQueries) { q =>
      testDfpAgent.isAdvertisementFeature(apiQuery(q)) should be(true)
    }
  }

  it should "be false for a non advertisement feature container" in {

    val apiQueries = Seq(
      "search?tag=type%2Fvideo&section=money",
      "search?tag=environment%2Fblog%7Cenvironment%2Fseries%2Fguardian-environment-blogs%7Cenvironment" +
        "%2Fgeorgemonbiot%7Cenvironment%2Fdamian-carrington-blog%7Cenvironment%2Fbike-blog",
      "search?tag=type%2Fgallery&section=sport&page-size=50",
      "search?tag=tone%2Freviews&section=culture%7Cmusic%7Cculture%7Cbooks%7Cartanddesign%7Cstage%7Ctv-and-radio",
      "search?tag=(tone%2Fanalysis%2C(world%2Fusa%7Cbusiness%2Fus-personal-finance))%7C(tone%2Fcomment%2C" +
        "(world%2Fusa%7Cbusiness%2Fus-personal-finance))&section=business",
      "search?tag=business/financial-sector|business/manufacturing-sector|business/luxury-goods-sector|business" +
        "/fooddrinks|business/theairlineindustry|business/automotive-industry|business/banking|business/construction" +
        "|film/film-industry|business/healthcare|business/insurance|business/mining|business/musicindustry|business" +
        "/pharmaceuticals-industry|business/realestate|business/retail|business/technology|business/telecoms|business" +
        "/tobacco-industry|business/travelleisure|business/utilities|business/services-sector",
      "technology?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "search?tag=world/mongolia|world/afghanistan|world/azerbaijan|world/bangladesh|world/bhutan|world/burma|world" +
        "/kazakhstan|world/kyrgyzstan|world/india|world/maldives|world/nepal|world/pakistan|world/srilanka|world" +
        "/tajikistan|world/turkmenistan|world/uzbekistan|world/brunei|world/cambodia|world/china|world/indonesia|world" +
        "/japan|world/laos|world/mongolia|world/malaysia|world/north-korea|world/philippines|world/singapore|world" +
        "/south-korea|world/taiwan|world/thailand|world/vietnam|world/timor-leste|world/tibet",
      "news/special",
      "uk/money?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "au?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "sport/motorsports?edition=au",
      "environment"
    )

    forEvery(apiQueries) { q =>
      testDfpAgent.isAdvertisementFeature(apiQuery(q)) should be(false)
    }
  }

  it should "be true for front of an ad feature section with a multi-part section name" in {
    testDfpAgent.isAdvertisementFeature(
      tagId = "sustainable-business-grundfos-partner-zone/sustainable-business-grundfos-partner-zone",
      sectionId = Some("sustainable-business/grundfos-partner-zone")
    ) should be(true)
  }

  it should "be true for an article in an ad feature section with a multi-part section name" in {
    testDfpAgent.isAdvertisementFeature(
      "sustainable-business-grundfos-partner-zone/sustainable-business-grundfos-partner-zone",
      Some("sustainable-business/grundfos-partner-zone")) should be(true)
  }

  "hasInlineMerchandise" should "be true if tag id has inline merchandising" in {
    testDfpAgent.hasInlineMerchandise(Seq(toKeyword("advert/ad-feature"))) should be(true)
  }

  it should "be true if keyword tag exists" in {
    val tags = Seq(
      toKeyword("culture/article"),
      toKeyword("advert/ad-feature")
    )
    testDfpAgent.hasInlineMerchandise(tags) should be(true)
  }

  it should "be false for a tag id which doesn't have inline merchandising" in {
    testDfpAgent.hasInlineMerchandise(Seq(toKeyword("culture/article"))) should be(false)
  }

  it should "be false if keyword tag doesn't exists" in {
    val tags = Seq(toKeyword("culture/article"), toSeries("advert/ad-feature")
    )
    testDfpAgent.hasInlineMerchandise(tags) should be(false)
  }

  "isSponsored" should "be true for a sponsored article" in {
    testDfpAgent.isSponsored("spon-page", None) should be(true)
  }

  it should "be true if section tag exists" in {
    val tags = Seq(toKeyword("media/media"))
    testDfpAgent.isSponsored(tags, sectionId = None) should be(true)
  }

  it should "be true if series exists" in {
    val tags = Seq(toSeries("foo/spon"))
    testDfpAgent.isSponsored(tags, sectionId = None) should be(false)
  }

  it should "be false for an unsponsored article" in {
    testDfpAgent.isSponsored("article", None) should be(false)
  }

  it should "be false for unsponsored tags" in {
    val tags = Seq(toKeyword("culture/books"))
    testDfpAgent.isSponsored(tags, sectionId = None) should be(false)
  }

  it should "be true for a sponsored tag and section combination" in {
    val tags = Seq(toKeyword("spinach/healthyliving", Some("spinach")))
    testDfpAgent.isSponsored(tags, sectionId = Some("spinach")) should be(true)
  }

  it should "be false for an unsponsored tag and section combination" in {
    val tags = Seq(toKeyword("culture/healthyliving", Some("culture")))
    testDfpAgent.isSponsored(tags, sectionId = Some("culture")) should be(false)
  }

  it should "be true for a sponsored container" in {

    val apiQueries = Seq(
      "search?tag=books%2Fmedia&section=money",
      "search?tag=environment%2Fblog%7Cmedia%2Fmedia%2Fguardian-environment-blogs%7Cenvironment" +
      "%2Fgeorgemonbiot%7Cenvironment%2Fdamian-carrington-blog%7books%2Fmedia",
      "search?tag=media%2Fmedia&section=sport&page-size=50",
      "search?tag=books%2Fgruel&section=culture%7Cmusic%7Cmedia%7Cbooks%7Cartanddesign%7Cstage%7Ctv-and-radio",
      "search?tag=(tone%2Fanalysis%2C(world%2Fusa%7Cmedia%2Fmedia))%7C(tone%2Fcomment%2C" +
      "(world%2Fusa%7Cbusiness%2Fus-personal-finance))&section=business",
      "search?tag=business/financial-sector|business/manufacturing-sector|business/luxury-goods-sector|business" +
      "/fooddrinks|business/theairlineindustry|business/automotive-industry|business/banking|business/construction" +
      "|mediao/gruel|business/healthcare|business/insurance|business/mining|business/musicindustry|business" +
      "/pharmaceuticals-industry|business/realestate|business/retail|business/technology|media/media|business" +
      "/tobacco-industry|business/travelleisure|business/utilities|business/services-sector",
      "media?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "search?tag=world/mongolia|world/afghanistan|books/media|world/bangladesh|world/bhutan|world/burma|world" +
      "/kazakhstan|world/kyrgyzstan|world/india|world/maldives|world/nepal|world/pakistan|world/srilanka|world" +
      "/tajikistan|world/turkmenistan|world/uzbekistan|world/brunei|world/cambodia|world/china|world/indonesia|world" +
      "/japan|world/laos|world/mongolia|world/malaysia|world/north-korea|world/philippines|world/singapore|world" +
      "/south-korea|world/taiwan|world/thailand|world/vietnam|world/timor-leste|world/tibet",
      "books/media",
      "books/media?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "media?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "books/media?edition=au",
      "media"
    )

    forEvery(apiQueries) { q =>
      testDfpAgent.isSponsored(apiQuery(q)) should be(true)
    }
  }

  it should "be false for a non sponsored container" in {

    val apiQueries = Seq(
      "search?tag=type%2Fvideo&section=money",
      "search?tag=environment%2Fblog%7Cenvironment%2Fseries%2Fguardian-environment-blogs%7Cenvironment" +
      "%2Fgeorgemonbiot%7Cenvironment%2Fdamian-carrington-blog%7Cenvironment%2Fbike-blog",
      "search?tag=type%2Fgallery&section=sport&page-size=50",
      "search?tag=tone%2Freviews&section=culture%7Cmusic%7Cculture%7Cbooks%7Cartanddesign%7Cstage%7Ctv-and-radio",
      "search?tag=(tone%2Fanalysis%2C(world%2Fusa%7Cbusiness%2Fus-personal-finance))%7C(tone%2Fcomment%2C" +
      "(world%2Fusa%7Cbusiness%2Fus-personal-finance))&section=business",
      "search?tag=business/financial-sector|business/manufacturing-sector|business/luxury-goods-sector|business" +
      "/fooddrinks|business/theairlineindustry|business/automotive-industry|business/banking|business/construction" +
      "|film/film-industry|business/healthcare|business/insurance|business/mining|business/musicindustry|business" +
      "/pharmaceuticals-industry|business/realestate|business/retail|business/technology|business/telecoms|business" +
      "/tobacco-industry|business/travelleisure|business/utilities|business/services-sector",
      "technology?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "search?tag=world/mongolia|world/afghanistan|world/azerbaijan|world/bangladesh|world/bhutan|world/burma|world" +
      "/kazakhstan|world/kyrgyzstan|world/india|world/maldives|world/nepal|world/pakistan|world/srilanka|world" +
      "/tajikistan|world/turkmenistan|world/uzbekistan|world/brunei|world/cambodia|world/china|world/indonesia|world" +
      "/japan|world/laos|world/mongolia|world/malaysia|world/north-korea|world/philippines|world/singapore|world" +
      "/south-korea|world/taiwan|world/thailand|world/vietnam|world/timor-leste|world/tibet",
      "news/special",
      "uk/money?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "au?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "sport/motorsports?edition=au",
      "environment"
    )

    forEvery(apiQueries) { q =>
      testDfpAgent.isSponsored(apiQuery(q)) should be(false)
    }
  }

  "isFoundationSupported" should "be true for a foundation-supported page" in {
    testDfpAgent.isFoundationSupported("chuckle", None) should be(true)
  }

  it should "be false for a non foundation-supported page" in {
    testDfpAgent.isFoundationSupported("guffaw", None) should be(false)
  }

  it should "be false for a container with multiple foundation-targeted keywords or series" in {
    val q =
      "search?tag=global-development/series/womens-rights-and-gender-equality-in-focus|" +
        "(world/gender,global-development/global-development)"
    testDfpAgent.isFoundationSupported(apiQuery(q)) should be(false)
  }

  it should "be true for a container with a single foundation-targeted keyword or series" in {
    val q =
      "search?tag=global-development/series/womens-rights-and-gender-equality-in-focus"
    testDfpAgent.isFoundationSupported(apiQuery(q)) should be(true)
  }

  "getSponsor" should "have some value for a sponsored tag with a specified sponsor" in {
    testDfpAgent.getSponsor("spon-page") should be(Some("spon"))
  }

  it should "have some value for an advertisement feature tag with a specified sponsor" in {
    testDfpAgent.getSponsor("ad-feature") should be(Some("spon2"))
  }

  it should "have no value for an advertisement feature tag without a specified sponsor" in {
    testDfpAgent.getSponsor("film") should be(None)
  }

  it should "have no value for an unsponsored tag" in {
    testDfpAgent.getSponsor("culture") should be(None)
  }

  it should "have some value for a sponsored container" in {
    val containerQuery = apiQuery(
      "search?tag=books/series/toptens|music/series/album-streams|music/series/new-music-from-around-the-world|music" +
        "/series/10-of-the-best|culture/series/the-10-best|books/series/the-100-best-novels|artanddesign/series" +
        "/exhibitionist|section7/healthyliving|stage/series/this-week-new-theatre")
    testDfpAgent.getSponsor(containerQuery) should be(Some("Squeegee"))
  }

  it should "have no value for an unsponsored container" in {
    val containerQuery = apiQuery(
      "search?tag=books/series/toptens|music/series/album-streams|music/series/new-music-from-around-the-world|music" +
        "/series/10-of-the-best|culture/series/the-10-best|books/series/the-100-best-novels|artanddesign/series" +
        "/exhibitionist|stage/series/this-week-new-theatre")
    testDfpAgent.getSponsor(containerQuery) should be(None)
  }

  "isPageSkinned" should "be true for a front with a pageskin in given edition" in {
    testDfpAgent.isPageSkinned("business/front", edition = defaultEdition) should be(true)
  }

  it should "be false for a front with a pageskin in another edition" in {
    testDfpAgent.isPageSkinned("business/front", edition = Au) should be(false)
  }

  it should "be false for a front without a pageskin" in {
    testDfpAgent.isPageSkinned("culture/front", edition = defaultEdition) should be(false)
  }

  it should "be false for a front with a pageskin in no edition" in {
    testDfpAgent.isPageSkinned("music/front", edition = defaultEdition) should be(false)
    testDfpAgent.isPageSkinned("music/front", edition = Us) should be(false)
  }

  it should "be false for any content (non-front) page" in {
    testDfpAgent.isPageSkinned("sport", edition = defaultEdition) should be(false)
  }

  "production DfpAgent" should "should not recognise adtest targetted line items" in {
    testDfpAgent.isPageSkinned("testSport/front", edition = defaultEdition) should be(false)
  }

  "non production DfpAgent" should "should recognise adtest targetted line items" in {
    notProductionTestDfpAgent.isPageSkinned("testSport/front", edition = defaultEdition) should be(
      true)
  }

  "generate tag to sponsors map" should "glom sponsorships together" in {
    val universitySponsorships =
      Sponsorship(List("universityguide", "university A"), sections = Nil, Some("University Sponsor A"), Nil, 1) ::
        Sponsorship(List("universityguide"), sections = Nil, Some("University Sponsor B"), Nil, 2) ::
        Nil

    val sponsorsMap: Map[String, Set[String]] = DfpAgent.generateTagToSponsorsMap(universitySponsorships)
    sponsorsMap should contain key "universityguide"
    sponsorsMap("universityguide") should equal(Set("University Sponsor A", "University Sponsor B"))
    sponsorsMap("university A") should equal(Set("University Sponsor A"))

  }

  it should "not bother with tag with no detected sponsors" in {
    val sponsorshipsWithANone =
      Sponsorship(List("universityguide", "university A"), sections = Nil, Some("University Sponsor A"), Nil, 3) ::
        Sponsorship(List("videogames"), sections = Nil, None, Nil, 4) ::
        Nil

    val sponsorsMap: Map[String, Set[String]] = DfpAgent.generateTagToSponsorsMap(sponsorshipsWithANone)
    sponsorsMap should contain key "universityguide"
    sponsorsMap("universityguide") should equal(Set("University Sponsor A"))
    sponsorsMap should not contain key("videogames")
  }

}
