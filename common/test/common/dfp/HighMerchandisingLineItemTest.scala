package common.dfp

import common.{Edition, editions}
import model.{Tag, TagProperties}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class HighMerchandisingLineItemTest extends AnyFlatSpec with Matchers {

  private object TestAgent extends HighMerchandiseComponentAgent {
    override protected def targetedHighMerchandisingLineItems: Seq[HighMerchandisingLineItem] = {
      Seq(
        HighMerchandisingLineItem(
          name = "test",
          id = 77942847,
          tags = Seq.empty,
          adUnitsIncluded = Seq(GuAdUnit("59359047", Seq("theguardian.com", "money"), GuAdUnit.ACTIVE)),
          adUnitsExcluded = Seq.empty,
          customTargetSet = Seq(
            CustomTargetSet(
              "AND",
              Seq(CustomTarget("slot", "IS", Seq("merchandising-high")), CustomTarget("edition", "IS", Seq("uk"))),
            ),
          ),
        ),
        HighMerchandisingLineItem(
          name = "test2",
          id = 77943847,
          tags = Seq("cricket", "England", "test"),
          adUnitsIncluded = Seq(GuAdUnit("59359047", Seq("theguardian.com", "sport"), GuAdUnit.ACTIVE)),
          adUnitsExcluded = Seq.empty,
          customTargetSet = Seq(CustomTargetSet("AND", Seq(CustomTarget("slot", "IS", Seq("merchandising-high"))))),
        ),
        HighMerchandisingLineItem(
          name = "test3",
          id = 77943847,
          tags = Seq.empty,
          adUnitsIncluded = Seq.empty,
          adUnitsExcluded = Seq.empty,
          customTargetSet = Seq(
            CustomTargetSet(
              "AND",
              Seq(
                CustomTarget("slot", "IS", Seq("merchandising-high")),
                CustomTarget(
                  "url",
                  "IS",
                  Seq(
                    "/commentisfree/2015/jul/21/it-hurts-but-im-going-to-defend-ashley-madison-and-37-million-cheaters",
                  ),
                ),
              ),
            ),
          ),
        ),
      )
    }

    override def isTargetedByHighMerch(adUnitSuffix: String, tags: Seq[Tag], edition: Edition, url: String): Boolean = {
      targetedHighMerchandisingLineItems.exists(_.matchesPageTargeting(adUnitSuffix, tags, edition, url))
    }
  }

  "hadHighMerchandisingTarget" should "be true if keywords, edition and adUnit match" in {
    TestAgent.isTargetedByHighMerch(
      "money",
      Seq.empty,
      editions.Uk,
      "/commentisfree/2016/may/25/greek-bailout-eu-on-best-behaviour-until-referendum-over-brexit",
    ) should be(true)
  }
  "hadHighMerchandisingTarget" should "be false if edition does not match" in {
    TestAgent.isTargetedByHighMerch(
      "money",
      Seq.empty,
      editions.Us,
      "/commentisfree/2016/may/25/greek-bailout-eu-on-best-behaviour-until-referendum-over-brexit",
    ) should be(false)
  }

  "hadHighMerchandisingTarget" should "be true if url matches" in {
    TestAgent.isTargetedByHighMerch(
      "technology",
      Seq.empty,
      editions.Uk,
      "/commentisfree/2015/jul/21/it-hurts-but-im-going-to-defend-ashley-madison-and-37-million-cheaters",
    ) should be(true)
  }

  "hadHighMerchandisingTarget" should "be true if keywords and adUnit match" in {
    val testTagsSeq = Seq(
      new Tag(
        TagProperties(
          id = "",
          url = "",
          tagType = "Keyword",
          sectionId = "",
          sectionName = "",
          webTitle = "cricket",
          webUrl = "",
          None,
          None,
          None,
          None,
          None,
          None,
          None,
          Seq.empty,
          None,
          None,
        ),
        None,
        None,
      ),
    )
    TestAgent.isTargetedByHighMerch(
      "sport",
      testTagsSeq,
      editions.Us,
      "/commentisfree/2016/may/25/greek-bailout-eu-on-best-behaviour-until-referendum-over-brexit",
    ) should be(true)
  }

}
