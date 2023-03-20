package model

import com.gu.facia.api.utils.{CardStyle, FaciaContentUtils, SpecialReport, SpecialReportAlt}
import com.gu.facia.client.models.TrailMetaData
import com.gu.targeting.client.{Campaign, ReportFields}
import com.gu.contentapi.client.model.v1.{Content => CapiContent}
import com.gu.facia.api.models.FaciaContent
import commercial.targeting.CampaignAgent

object CardStylePicker {

  def apply(content: CapiContent): CardStyle = {
    val tags = content.tags.map(_.id).toSeq
    extractCampaigns(tags) match {
      case OtherCampaign            => CardStyle(content, TrailMetaData.empty)
      case SpecialReportCampaign    => SpecialReport
      case SpecialReportAltCampaign => SpecialReportAlt
    }
  }

  def apply(content: FaciaContent): CardStyle = {
    val tags = FaciaContentUtils.tags(content).map(_.id)
    extractCampaigns(tags) match {
      case OtherCampaign            => FaciaContentUtils.cardStyle(content)
      case SpecialReportCampaign    => SpecialReport
      case SpecialReportAltCampaign => SpecialReportAlt
    }
  }

  sealed trait CampaignType
  case object SpecialReportCampaign extends CampaignType
  case object SpecialReportAltCampaign extends CampaignType
  case object OtherCampaign extends CampaignType

  private def extractCampaigns(tags: Seq[String]): CampaignType =
    getCampaignType(CampaignAgent.getCampaignsForTags(tags))

  def getCampaignType(campaigns: Seq[Campaign]): CampaignType = {
    campaigns match {
      case Nil => OtherCampaign
      case head :: tail =>
        head.fields match {
          case ReportFields(campaignId) =>
            if (campaignId.toLowerCase() == "specialreportalt") SpecialReportAltCampaign else SpecialReportCampaign
          case _ => getCampaignType(tail)
        }
    }
  }
}
