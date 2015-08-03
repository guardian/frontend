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

  private object TestPageskinAdAgent extends PageskinAdAgent {
    override protected val isProd: Boolean = true
    override protected def pageSkinSponsorships: Seq[PageSkinSponsorship] = examplePageSponsorships
  }

  private object NotProductionTestPageskinAdAgent extends PageskinAdAgent {
    override protected val isProd: Boolean = false
    override protected def pageSkinSponsorships: Seq[PageSkinSponsorship] = examplePageSponsorships
  }

  "isPageSkinned" should "be true for a front with a pageskin in given edition" in {
    TestPageskinAdAgent.isPageSkinned("business/front", edition = defaultEdition) should be(true)
  }

  it should "be false for a front with a pageskin in another edition" in {
    TestPageskinAdAgent.isPageSkinned("business/front", edition = Au) should be(false)
  }

  it should "be false for a front without a pageskin" in {
    TestPageskinAdAgent.isPageSkinned("culture/front", edition = defaultEdition) should be(false)
  }

  it should "be false for a front with a pageskin in no edition" in {
    TestPageskinAdAgent.isPageSkinned("music/front", edition = defaultEdition) should be(false)
    TestPageskinAdAgent.isPageSkinned("music/front", edition = Us) should be(false)
  }

  it should "be false for any content (non-front) page" in {
    TestPageskinAdAgent.isPageSkinned("sport", edition = defaultEdition) should be(false)
  }

  "production DfpAgent" should "not recognise adtest targetted line items" in {
    TestPageskinAdAgent.isPageSkinned("testSport/front", edition = defaultEdition) should be(false)
  }

  "non production DfpAgent" should "should recognise adtest targetted line items" in {
    NotProductionTestPageskinAdAgent.isPageSkinned("testSport/front",
      edition = defaultEdition) should be(
      true)
  }
}
