package model

import com.gu.facia.api.utils.{CardStyle, SpecialReport}
import com.gu.facia.client.models.{MetaDataCommonFields, TrailMetaData}
import com.gu.targeting.client.{Campaign, ReportFields}
import com.gu.contentapi.client.model.{v1 => contentapi}
import commercial.targeting.CampaignAgent

object CardStylePicker {

  def apply(content: contentapi.Content, trailMetaData: MetaDataCommonFields): CardStyle = {
    extractCampaigns(content) match {
      case Nil => CardStyle(content, TrailMetaData.empty)
      case _ => SpecialReport
    }
  }

  private def extractCampaigns(content: contentapi.Content): List[Campaign] = {
    CampaignAgent.getCampaignsForTags(content.tags.map(_.id))
      .filterNot(_.fields == ReportFields)
  }
}
