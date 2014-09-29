package views.support

import com.gu.facia.client.models.CollectionConfig
import model.{Trail, Tag}

object ItemKicker {
  private def firstTag(item: Trail): Option[Tag] = item.tags.headOption

  def fromTrail(trail: Trail, config: CollectionConfig): Option[ItemKicker] = {
    lazy val maybeTag = firstTag(trail)

    if (trail.isBreaking) {
      Some(BreakingNewsKicker)
    } else if (trail.isLive) {
      Some(LiveKicker)
    } else if (trail.isAnalysis) {
      Some(AnalysisKicker)
    } else if (config.showTags.exists(_==true) && maybeTag.isDefined) {
      maybeTag map { tag =>
        TagKicker(tag.name, tag.webUrl)
      }
    } else if (config.showSections.exists(_==true)) {
      Some(SectionKicker(trail.sectionName.capitalize, "/" + trail.section))
    } else {
      None
    }
  }
}

sealed trait ItemKicker

case object BreakingNewsKicker extends ItemKicker
case object LiveKicker extends ItemKicker
case object AnalysisKicker extends ItemKicker
case class TagKicker(name: String, url: String) extends ItemKicker
case class SectionKicker(name: String, url: String) extends ItemKicker
