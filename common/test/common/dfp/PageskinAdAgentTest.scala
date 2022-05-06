package common.dfp

import com.gu.commercial.display.{AdTargetParam, KeywordParam, SeriesParam}
import com.gu.contentapi.client.model.v1.{Tag, TagType}
import common.Edition.defaultEdition
import common.commercial.{CommercialProperties, EditionAdTargeting}
import common.editions.{Uk}
import conf.Configuration.commercial.dfpAdUnitGuRoot
import model.MetaData
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.test.FakeRequest
import play.api.test.Helpers.GET

class PageskinAdAgentTest extends AnyFlatSpec with Matchers {
  val keywordParamSet: Set[AdTargetParam] = KeywordParam.fromItemId("sport-keyword").toSet
  val commercialProperties = CommercialProperties(
    editionBrandings = Set.empty,
    editionAdTargetings = Set(EditionAdTargeting(defaultEdition, Some(keywordParamSet))),
    prebidIndexSites = None,
  )

  val requestAU = FakeRequest(GET, "/au?_edition=au")
  val requestUS = FakeRequest(GET, "/us?_edition=us")
  val requestUK = FakeRequest(GET, "/uk?_edition=uk")
  val requestWithAdTestParam = FakeRequest(GET, "/uk?_edition=uk&adtest=6")
  val colourSeriesCommercial = CommercialProperties(
    editionBrandings = Set.empty,
    prebidIndexSites = None,
    editionAdTargetings = Set(
      EditionAdTargeting(
        defaultEdition, // Uk
        Some(
          SeriesParam
            .from(
              // This is how we create a new Tag in the code.
              Tag.apply(
                id = "new-view-series",
                `type` = TagType.Series,
                webTitle = "Some colour serie",
                webUrl = "http://www.example.com",
                apiUrl = "http://api.example.com",
              ),
            )
            .toSet,
        ),
      ),
    ),
  )

  val pressedFrontMeta = MetaData.make("", None, "The title", None, isFront = true, isPressedPage = true)
  val colourSeriesMeta = MetaData.make(
    "",
    None,
    "The title",
    None,
    isFront = true,
    isPressedPage = false,
    commercial = Some(colourSeriesCommercial),
  )

  val sportIndexFrontMeta =
    MetaData.make("", None, "The title", None, isFront = true, commercial = Some(commercialProperties))
  val articleMeta = MetaData.make("", None, "The title", None)

  val keywordPressedFrontMeta = MetaData.make(
    "",
    None,
    "The title",
    None,
    isFront = true,
    isPressedPage = true,
    commercial = Some(commercialProperties),
  )

  val examplePageSponsorships = Seq(
    PageSkinSponsorship(
      "lineItemName",
      1234L,
      Seq("business/front"),
      Seq(Uk),
      Seq("United Kingdom"),
      targetsAdTest = false,
      adTestValue = None,
      keywords = Seq.empty,
      series = Seq.empty,
    ),
    PageSkinSponsorship(
      "lineItemName2",
      12345L,
      Seq("music/front"),
      Nil,
      Nil,
      targetsAdTest = false,
      adTestValue = None,
      keywords = Seq.empty,
      series = Seq.empty,
    ),
    PageSkinSponsorship(
      "lineItemName3",
      123456L,
      Seq("sport"),
      Nil,
      Nil,
      targetsAdTest = false,
      adTestValue = None,
      keywords = Seq.empty,
      series = Seq.empty,
    ),
    PageSkinSponsorship(
      "lineItemName4",
      1234567L,
      Seq("testSport/front"),
      Seq(Uk),
      Seq("United Kingdom"),
      targetsAdTest = true,
      adTestValue = Some("6"),
      keywords = Seq.empty,
      series = Seq.empty,
    ),
    PageSkinSponsorship(
      "lineItemName5",
      123458L,
      Seq("sport-index"),
      Seq(Uk),
      Nil,
      targetsAdTest = false,
      adTestValue = None,
      keywords = Seq("sport-keyword"),
      series = Seq.empty,
    ),
    PageSkinSponsorship(
      // Modeled after a real test example:
      // https://www.google.com/dfp/59666047#delivery/LineItemDetail/orderId=2259406532&lineItemId=4600377077
      "lineItemName6",
      4600377077L,
      Seq("fake-series-adunit"),
      Seq(Uk),
      Nil,
      targetsAdTest = false,
      adTestValue = None,
      keywords = Seq.empty,
      series = Seq("new-view-series"),
    ),
  )

  // WARNING: Despite being called 'TestPageskinAgent',
  // this is considered 'Production' by the superclass, because 'environmentIsProd' is true.
  // So only PageSkinSponsorship with targetsAdTest = false will potentially match
  private object TestPageskinAdAgent extends PageskinAdAgent {
    override protected val environmentIsProd: Boolean = true
    override protected def pageSkinSponsorships: Seq[PageSkinSponsorship] = examplePageSponsorships
  }

  // NOTE: 'NotProduction' here means 'Test', like in 'Test server'
  // PageSkinSponsorship with targetsAdTest = true will potentially match
  private object NotProductionTestPageskinAdAgent extends PageskinAdAgent {
    override protected val environmentIsProd: Boolean = false
    override protected def pageSkinSponsorships: Seq[PageSkinSponsorship] = examplePageSponsorships
  }

  "isPageSkinned" should "be true for a front with a pageskin in given edition" in {
    TestPageskinAdAgent.hasPageSkin(
      s"$dfpAdUnitGuRoot/business/front",
      pressedFrontMeta,
      requestUK,
    ) should be(true)
  }

  it should "be true for a series front" in {
    TestPageskinAdAgent.hasPageSkin(
      s"$dfpAdUnitGuRoot/fake-series-adunit/new-view-series",
      colourSeriesMeta,
      requestUK,
    ) should be(true)
  }

  it should "be false for a front with a pageskin in another edition" in {
    TestPageskinAdAgent.hasPageSkin(
      s"$dfpAdUnitGuRoot/business/front",
      pressedFrontMeta,
      requestAU,
    ) should be(false)
  }

  it should "be false for a front without a pageskin" in {
    TestPageskinAdAgent.hasPageSkin(
      s"$dfpAdUnitGuRoot/culture/front",
      pressedFrontMeta,
      requestUK,
    ) should be(
      false,
    )
  }

  it should "be false for a front with a pageskin in no edition" in {
    TestPageskinAdAgent.hasPageSkin(
      s"$dfpAdUnitGuRoot/music/front",
      pressedFrontMeta,
      requestUK,
    ) should be(false)
    TestPageskinAdAgent.hasPageSkin(
      s"$dfpAdUnitGuRoot/music/front",
      pressedFrontMeta,
      requestUK,
    ) should be(false)
  }

  it should "be false for a content (non-front) page" in {
    TestPageskinAdAgent.hasPageSkin(
      s"$dfpAdUnitGuRoot/sport",
      articleMeta,
      requestUK,
    ) should be(false)
  }

  it should "be true for an index front (tag page)" in {
    TestPageskinAdAgent.hasPageSkin(
      s"$dfpAdUnitGuRoot/sport-index",
      sportIndexFrontMeta,
      requestUK,
    ) should be(
      true,
    )
  }

  "non production DfpAgent" should "should recognise adtest targetted line items only if the request includes the same adtest param" in {
    NotProductionTestPageskinAdAgent.hasPageSkin(
      s"$dfpAdUnitGuRoot/testSport/front",
      pressedFrontMeta,
      requestWithAdTestParam,
    ) should be(true)
  }

  "production DfpAgent" should "should recognise adtest targetted line items only if the request includes the same adtest param" in {
    TestPageskinAdAgent.hasPageSkin(
      s"$dfpAdUnitGuRoot/testSport/front",
      pressedFrontMeta,
      requestWithAdTestParam,
    ) should be(
      true,
    )
  }

  "findSponsorships" should "find keyword-targeted sponsorship when keyword page has been overwritten by a pressed front" in {
    TestPageskinAdAgent.findSponsorships(
      adUnitPath = "/123456/root/technology/subsection/ng",
      metaData = keywordPressedFrontMeta,
      edition = Uk,
    ) shouldBe Seq(
      PageSkinSponsorship(
        lineItemName = "lineItemName5",
        lineItemId = 123458,
        adUnits = Seq("sport-index"),
        editions = Seq(Uk),
        countries = Nil,
        targetsAdTest = false,
        adTestValue = None,
        keywords = Seq("sport-keyword"),
        series = Nil,
      ),
    )
  }

  it should "find section-targeted sponsorship without needing an 'ng' ad unit suffix" in {
    NotProductionTestPageskinAdAgent.findSponsorships(
      adUnitPath = "/123456/root/testSport/front/ng",
      metaData = keywordPressedFrontMeta,
      edition = Uk,
    ) shouldBe Seq(
      PageSkinSponsorship(
        lineItemName = "lineItemName4",
        lineItemId = 1234567,
        adUnits = Seq("testSport/front"),
        editions = Seq(Uk),
        countries = Seq("United Kingdom"),
        targetsAdTest = true,
        adTestValue = Some("6"),
        keywords = Nil,
        series = Nil,
      ),
    )
  }
}
