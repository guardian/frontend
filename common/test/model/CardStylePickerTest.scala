package model

import com.gu.facia.api.utils.{SpecialReport, SpecialReportAlt}
import com.gu.targeting.client.{Campaign, ReportFields, Rule}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.util.UUID

class CardStylePickerTest extends AnyFlatSpec with Matchers {

  def createCampaign(campaignId: String) =
    Campaign(
      id = UUID.randomUUID(),
      name = "Campaign",
      rules = List(Rule(requiredTags = List("tag1", "tag2"), lackingTags = List("tag3"), matchAllTags = true)),
      priority = 1,
      activeFrom = None,
      activeUntil = None,
      displayOnSensitive = true,
      fields = ReportFields(campaignId),
    )

  "CardStylePicker.getCampaignCardStyle" should "return SpecialReportAlt CardStyle when a SpecialReportAlt campaign is present" in {
    val campaign = createCampaign("SpecialReportAlt")
    CardStylePicker.getCardStyleForReport(List(campaign)) shouldBe SpecialReportAlt
  }

  it should "return SpecialReport CardStyle in any other report campaign" in {
    val campaign = createCampaign("ThePandoraPapers")
    CardStylePicker.getCardStyleForReport(List(campaign)) shouldBe SpecialReport
  }
}
