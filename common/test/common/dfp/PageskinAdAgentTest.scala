package common.dfp

import common.Edition.defaultEdition
import common.editions.{Au, Uk, Us}
import conf.Configuration.commercial.dfpAdUnitRoot
import org.scalatest.{FlatSpec, Matchers}

class PageskinAdAgentTest extends FlatSpec with Matchers {

  val examplePageSponsorships = Seq(
    PageSkinSponsorship("lineItemName",
      1234L,
      Seq(s"$dfpAdUnitRoot/business/front"),
      Seq(Uk),
      Seq("United Kingdom"),
      isR2Only = false,
      targetsAdTest = false,
      None),
    PageSkinSponsorship("lineItemName2",
      12345L,
      Seq(s"$dfpAdUnitRoot/music/front"),
      Nil,
      Nil,
      isR2Only = false,
      targetsAdTest = false,
      None),
    PageSkinSponsorship("lineItemName3",
      123456L,
      Seq(s"$dfpAdUnitRoot/sport"),
      Nil,
      Nil,
      isR2Only = false,
      targetsAdTest = false,
      None),
    PageSkinSponsorship("lineItemName4",
      1234567L,
      Seq(s"$dfpAdUnitRoot/testSport/front"),
      Seq(Uk),
      Seq("United Kingdom"),
      isR2Only = false,
      targetsAdTest = true,
      Some("6"))
  )

  private object TestPageskinAdAgent extends PageskinAdAgent {
    override protected val isProd: Boolean = true
    override protected def pageSkinSponsorships: Seq[PageSkinSponsorship] = examplePageSponsorships
  }

  private object NotProductionTestPageskinAdAgent extends PageskinAdAgent {
    override protected val isProd: Boolean = false
    override protected def pageSkinSponsorships: Seq[PageSkinSponsorship] = examplePageSponsorships
  }

  "isPageSkinned" should "be true for a front with a pageskin in given edition" in {
    TestPageskinAdAgent.hasPageSkin("business/front", edition = defaultEdition) should be(true)
  }

  it should "be false for a front with a pageskin in another edition" in {
    TestPageskinAdAgent.hasPageSkin("business/front", edition = Au) should be(false)
  }

  it should "be false for a front without a pageskin" in {
    TestPageskinAdAgent.hasPageSkin("culture/front", edition = defaultEdition) should be(false)
  }

  it should "be false for a front with a pageskin in no edition" in {
    TestPageskinAdAgent.hasPageSkin("music/front", edition = defaultEdition) should be(false)
    TestPageskinAdAgent.hasPageSkin("music/front", edition = Us) should be(false)
  }

  it should "be false for any content (non-front) page" in {
    TestPageskinAdAgent.hasPageSkin("sport", edition = defaultEdition) should be(false)
  }

  "production DfpAgent" should "not recognise adtest targetted line items" in {
    TestPageskinAdAgent.hasPageSkin("testSport/front", edition = defaultEdition) should be(false)
  }

  "non production DfpAgent" should "should recognise adtest targetted line items" in {
    NotProductionTestPageskinAdAgent.hasPageSkin("testSport/front",
      edition = defaultEdition) should be(
      true)
  }
}
