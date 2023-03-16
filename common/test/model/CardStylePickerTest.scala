package model

import com.gu.facia.api.utils.{SpecialReport, SpecialReportAlt}
import com.gu.targeting.client.{Campaign, ReportFields, Rule}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.util.UUID

class CardStylePickerTest extends AnyFlatSpec with Matchers {
  "CardStylePicker.getCampaignCardStyle" should "return SpecialReportAlt CardStyle when a SpecialReportAlt campaign is present" in {
    val campaign = Campaign(
      id = UUID.randomUUID(),
      name = "Campaign 1",
      rules = List(Rule(requiredTags = List("tag1", "tag2"), lackingTags = List("tag3"), matchAllTags = true)),
      priority = 1,
      activeFrom = None,
      activeUntil = None,
      displayOnSensitive = true,
      fields = ReportFields("SpecialReportAlt"),
    )

    CardStylePicker.getCardStyleForCampaign(List(campaign)) shouldBe SpecialReportAlt
  }

  it should "return SpecialReport CardStyle in any other report campaign" in {
    val campaign = Campaign(
      id = UUID.randomUUID(),
      name = "Campaign 2",
      rules = List(Rule(requiredTags = List("tag5", "tag6"), lackingTags = List("tag7"), matchAllTags = true)),
      priority = 1,
      activeFrom = None,
      activeUntil = None,
      displayOnSensitive = true,
      fields = ReportFields("ThePandoraPapers"),
    )

    CardStylePicker.getCardStyleForCampaign(List(campaign)) shouldBe SpecialReport
  }
}
