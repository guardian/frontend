package common.dfp

import common.{Edition, editions}
import model.{Tag, TagProperties}
import org.scalatest.{FlatSpec, Matchers}


class HighMerchandisingLineItemTest extends FlatSpec with Matchers {

  private object TestAgent extends HighMerchandiseComponentAgent {
   override protected def targetedHighMerchandisingLineItems: Seq[HighMerchandisingLineItem] = {
      Seq(HighMerchandisingLineItem(
        name = "test",
        id = 77942847,
        tags = Seq.empty,
        adUnits = Seq(GuAdUnit("59359047", Seq("theguardian.com","money"))),
        customTargetSet = Seq(CustomTargetSet("AND",Seq(CustomTarget("slot","IS",Seq("merchandising-high")),CustomTarget("edition","IS",Seq("uk")))))
      ),
        HighMerchandisingLineItem(
          name = "test2",
          id = 77943847,
          tags = Seq("cricket","England","test"),
          adUnits = Seq(GuAdUnit("59359047", Seq("theguardian.com","sport"))),
          customTargetSet = Seq(CustomTargetSet("AND",Seq(CustomTarget("slot","IS",Seq("merchandising-high")))))
        )
      )
   }

    override def isTargetedByHighMerch(adUnitSuffix:String, tags: Seq[Tag],edition:Edition) = {
        targetedHighMerchandisingLineItems.exists(_.matchesPageTargeting(adUnitSuffix, tags, edition))
    }

  }

  "hadHighMerchandisingTarget" should "be true if keywords, edition and adUnit match" in {
    TestAgent.isTargetedByHighMerch("money",Seq.empty, editions.Uk)should be(true)
  }
  "hadHighMerchandisingTarget" should "be false if edition does not match" in {
    TestAgent.isTargetedByHighMerch("money",Seq.empty, editions.Us)should be(false)
  }

  "hadHighMerchandisingTarget" should "be true if keywords and adUnit match" in {
    val testTagsSeq = Seq(new Tag(
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
        None

      ),None,None,None
    ))
    TestAgent.isTargetedByHighMerch("sport", testTagsSeq, editions.Us) should be(true)
  }

}
