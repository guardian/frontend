package model

import com.gu.facia.api.utils.{CardStyle, FaciaContentUtils, SpecialReport, SpecialReportAlt}
import com.gu.facia.client.models.{MetaDataCommonFields, TrailMetaData}
import com.gu.targeting.client.{Campaign, ReportFields}
import com.gu.contentapi.client.model.v1.{Content => CapiContent}
import com.gu.facia.api.models.FaciaContent
import commercial.targeting.CampaignAgent

object CardStylePicker {

  def apply(content: CapiContent): CardStyle = {
    val tags = content.tags.map(_.id).toSeq
    val campaigns = extractCampaigns(tags)
    campaigns match {
      case Nil => CardStyle(content, TrailMetaData.empty)
      case _   => getCardStyleForCampaign(campaigns)
    }
  }

  def apply(content: FaciaContent): CardStyle = {
    val tags = FaciaContentUtils.tags(content).map(_.id)
    val campaigns = extractCampaigns(tags)
    campaigns match {
      case Nil => FaciaContentUtils.cardStyle(content)
      case _   => getCardStyleForCampaign(campaigns)
    }
  }

  def getCardStyleForCampaign(campaigns: List[Campaign]): CardStyle = {
    if (containsSpecialReportAltCampaign(campaigns)) SpecialReportAlt else SpecialReport
  }

  private def containsSpecialReportAltCampaign(campaigns: List[Campaign]): Boolean = {
    val specialReportAltCampaigns = campaigns.filter(campaign =>
      campaign.fields.asInstanceOf[ReportFields].campaignId.toLowerCase() == "specialreportalt",
    )
    specialReportAltCampaigns.nonEmpty
  }

  private def extractCampaigns(tags: Seq[String]): List[Campaign] = {
    CampaignAgent
      .getCampaignsForTags(tags)
      .filter(_.fields.isInstanceOf[ReportFields])
  }
}
