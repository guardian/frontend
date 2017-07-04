package model

import com.gu.facia.api.utils.{CardStyle, SpecialReport}
import com.gu.facia.client.models.{MetaDataCommonFields, TrailMetaData}
import com.gu.targeting.client.ReportFields
import com.gu.contentapi.client.model.{v1 => contentapi}
import commercial.targeting.CampaignAgent

object CardStylePicker {

  def apply(content: contentapi.Content, trailMetaData: MetaDataCommonFields): CardStyle = {
    specialReportFromTargeting(content) getOrElse CardStyle(content, TrailMetaData.empty)
  }

  private def specialReportFromTargeting(content: contentapi.Content): Option[CardStyle] = {
    CampaignAgent.getCampaignsForTags(content.tags.map(_.id))
      .filterNot(_.fields == ReportFields)
      .map(_ => SpecialReport)
      .headOption
  }
}
