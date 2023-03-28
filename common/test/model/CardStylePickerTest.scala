package model

import com.gu.targeting.client.{Campaign, EpicFields, ReportFields, Rule}
import model.CardStylePicker.{OtherCampaign, SpecialReportAltCampaign, SpecialReportCampaign}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.util.UUID

class CardStylePickerTest extends AnyFlatSpec with Matchers {

  def createReportCampaign(campaignId: String) =
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

  val epicCampaign =
    Campaign(
      id = UUID.randomUUID(),
      name = "Campaign",
      rules = List(Rule(requiredTags = List("tag1", "tag2"), lackingTags = List("tag3"), matchAllTags = true)),
      priority = 1,
      activeFrom = None,
      activeUntil = None,
      displayOnSensitive = true,
      fields = EpicFields("Epic-campaign"),
    )

  "CardStylePicker.getCampaignType" should "return SpecialReportAltCampaign when a SpecialReportAlt campaign is present" in {
    val reportCampaign = createReportCampaign("SpecialReportAlt")
    CardStylePicker.getCampaignType(List(reportCampaign, epicCampaign)) shouldBe SpecialReportAltCampaign
  }

  it should "return SpecialReportCampaign in any other report campaign" in {
    val reportCampaign = createReportCampaign("ThePandoraPapers")
    CardStylePicker.getCampaignType(List(epicCampaign, reportCampaign)) shouldBe SpecialReportCampaign
  }

  it should "return OtherCampaign if no campaign is present" in {
    CardStylePicker.getCampaignType(List.empty) shouldBe OtherCampaign
  }

  it should "return OtherCampaign if any other non-Report type of campaign is present" in {
    CardStylePicker.getCampaignType(List(epicCampaign)) shouldBe OtherCampaign
  }
}
