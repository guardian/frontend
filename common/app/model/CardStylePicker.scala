package model

import com.gu.facia.api.utils.{CardStyle, FaciaContentUtils, SpecialReport}
import com.gu.facia.client.models.{MetaDataCommonFields, TrailMetaData}
import com.gu.targeting.client.{Campaign, ReportFields}
import com.gu.contentapi.client.model.v1.{Content => CapiContent}
import com.gu.facia.api.models.FaciaContent
import commercial.targeting.CampaignAgent

object CardStylePicker {

  def apply(content: CapiContent, trailMetaData: MetaDataCommonFields): CardStyle = {
    val tags = content.tags.map(_.id).toSeq
    extractCampaigns(tags) match {
      case Nil => CardStyle(content, TrailMetaData.empty)
      case _   => SpecialReport
    }
  }

  def apply(content: FaciaContent): CardStyle = {
    val tags = FaciaContentUtils.tags(content).map(_.id)
    extractCampaigns(tags) match {
      case Nil => FaciaContentUtils.cardStyle(content)
      case _   => SpecialReport
    }
  }

  private def extractCampaigns(tags: Seq[String]): List[Campaign] = {
    CampaignAgent
      .getCampaignsForTags(tags)
      .filter(_.fields.isInstanceOf[ReportFields])
  }
}
