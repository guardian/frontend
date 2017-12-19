package model

import model.pressed.{ItemKicker, PressedContent}
import org.joda.time.DateTime
import services.FaciaContentConvert
import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import common.Edition
import layout.{Byline, FrontPage, FrontPageGrouping, FrontPageItem}

case class CrosswordResultsPage(
  page: Page,
  contents: Seq[FrontPageItem],
  date: DateTime,
) extends FrontPage {

  override def isFootballTeam: Boolean = false
  override def hideCutOuts: Boolean = false
  override def idWithoutEdition: String = page.metadata.id
  override def bylineTransformer: Option[Byline] => Option[Byline] = byline => byline
  override def isSlow: Boolean = false
  override def kickerTransformer: ItemKicker => Option[ItemKicker] = kicker => Some(kicker)
  override def grouping: Edition => Seq[FrontPageGrouping] = (edition) => FrontPageGrouping.fromContent(trails, edition.timezone)

}
