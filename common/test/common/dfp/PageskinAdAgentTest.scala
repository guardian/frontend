package common.dfp

import com.gu.commercial.display.{AdTargetParam, KeywordParam}
import common.Edition.defaultEdition
import common.commercial.{CommercialProperties, EditionAdTargeting}
import common.editions.{Au, Uk, Us}
import conf.Configuration.commercial.dfpAdUnitGuRoot
import model.MetaData
import org.scalatest.{FlatSpec, Matchers}

class PageskinAdAgentTest extends FlatSpec with Matchers {
  val keywordParamSet: Set[AdTargetParam] = KeywordParam.fromItemId("sport-keyword").toSet
  val commercialProperties = CommercialProperties(
    editionBrandings = Set.empty,
    editionAdTargetings = Set(EditionAdTargeting(defaultEdition, Some(keywordParamSet))),
    prebidIndexSites = None
  )
  val pressedFrontMeta = MetaData.make("", None, "The title", None, isFront = true, isPressedPage = true)
  val indexFrontMeta = MetaData.make("", None, "The title", None, isFront = true, commercial = Some(commercialProperties))
  val articleMeta = MetaData.make("", None, "The title", None)

  val examplePageSponsorships = Seq(
    PageSkinSponsorship(
      "lineItemName",
      1234L,
      Seq("business/front"),
      Seq(Uk),
      Seq("United Kingdom"),
      isR2Only = false,
      targetsAdTest = false,
      adTestValue = None,
      keywords = Seq.empty,
      series = Seq.empty
    ),
    PageSkinSponsorship(
      "lineItemName2",
      12345L,
      Seq("music/front"),
      Nil,
      Nil,
      isR2Only = false,
      targetsAdTest = false,
      adTestValue = None,
      keywords = Seq.empty,
      series = Seq.empty
    ),
    PageSkinSponsorship(
      "lineItemName3",
      123456L,
      Seq("sport"),
      Nil,
      Nil,
      isR2Only = false,
      targetsAdTest = false,
      adTestValue = None,
      keywords = Seq.empty,
      series = Seq.empty
    ),
    PageSkinSponsorship(
      "lineItemName4",
      1234567L,
      Seq("testSport/front"),
      Seq(Uk),
      Seq("United Kingdom"),
      isR2Only = false,
      targetsAdTest = true,
      adTestValue = Some("6"),
      keywords = Seq.empty,
      series = Seq.empty
    ),
    PageSkinSponsorship(
      "lineItemName5",
      123458L,
      Seq("sport-index"),
      Seq(Uk),
      Nil,
      isR2Only = false,
      targetsAdTest = false,
      adTestValue = None,
      keywords = Seq("sport-keyword"),
      series = Seq.empty
    )
  )

  private object TestPageskinAdAgent extends PageskinAdAgent {
    override protected val environmentIsProd: Boolean = true
    override protected def pageSkinSponsorships: Seq[PageSkinSponsorship] = examplePageSponsorships
  }

  private object NotProductionTestPageskinAdAgent extends PageskinAdAgent {
    override protected val environmentIsProd: Boolean = false
    override protected def pageSkinSponsorships: Seq[PageSkinSponsorship] = examplePageSponsorships
  }

  "isPageSkinned" should "be true for a front with a pageskin in given edition" in {
    TestPageskinAdAgent.hasPageSkin(s"$dfpAdUnitGuRoot/business/front", pressedFrontMeta, Uk) should be(true)
  }

  it should "be false for a front with a pageskin in another edition" in {
    TestPageskinAdAgent.hasPageSkin(s"$dfpAdUnitGuRoot/business/front", pressedFrontMeta, Au) should be(false)
  }

  it should "be false for a front without a pageskin" in {
    TestPageskinAdAgent.hasPageSkin(s"$dfpAdUnitGuRoot/culture/front", pressedFrontMeta, defaultEdition) should be(false)
  }

  it should "be false for a front with a pageskin in no edition" in {
    TestPageskinAdAgent.hasPageSkin(s"$dfpAdUnitGuRoot/music/front", pressedFrontMeta, defaultEdition) should be(false)
    TestPageskinAdAgent.hasPageSkin(s"$dfpAdUnitGuRoot/music/front", pressedFrontMeta, Us) should be(false)
  }

  it should "be false for a content (non-front) page" in {
    TestPageskinAdAgent.hasPageSkin(s"$dfpAdUnitGuRoot/sport", articleMeta, defaultEdition) should be(false)
  }

  it should "be true for an index front (tag page)" in {
    TestPageskinAdAgent.hasPageSkin(s"$dfpAdUnitGuRoot/sport-index", indexFrontMeta, defaultEdition) should be(true)
  }

  "production DfpAgent" should "not recognise adtest targetted line items" in {
    TestPageskinAdAgent.hasPageSkin(s"$dfpAdUnitGuRoot/testSport/front", pressedFrontMeta, defaultEdition) should be(false)
  }

  "non production DfpAgent" should "should recognise adtest targetted line items" in {
    NotProductionTestPageskinAdAgent.hasPageSkin(s"$dfpAdUnitGuRoot/testSport/front", pressedFrontMeta,
      defaultEdition) should be(
      true)
  }
}
