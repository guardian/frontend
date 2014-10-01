package views.support

import model.{Trail, Tag}

object ItemKicker {
  private def firstTag(item: Trail): Option[Tag] = item.tags.headOption

  def fromTrail(trail: Trail, config: model.Config): Option[ItemKicker] = {
    lazy val maybeTag = firstTag(trail)

    def tagKicker = maybeTag map { tag =>
      TagKicker(tag.name, tag.webUrl)
    }

    def sectionKicker = Some(SectionKicker(trail.sectionName.capitalize, "/" + trail.section))

    if (trail.showKickerTag && maybeTag.isDefined) {
      tagKicker
    } else if (trail.showKickerSection) {
      sectionKicker
    } else if (config.showTags && maybeTag.isDefined) {
      tagKicker
    } else if (config.showSections) {
      sectionKicker
    } else if (!config.hideKickers) {
      tonalKicker(trail)
    } else {
      None
    }
  }

  private def tonalKicker(trail: Trail): Option[ItemKicker] = {
    if (trail.isBreaking) {
      Some(BreakingNewsKicker)
    } else if (trail.isLive) {
      Some(LiveKicker)
    } else if (trail.isPodcast) {
      val series = trail.tags.find(_.tagType == "series") map { seriesTag =>
        Series(seriesTag.webTitle, seriesTag.webUrl)
      }
      Some(PodcastKicker(series))
    } else if (trail.isAnalysis) {
      Some(AnalysisKicker)
    } else if (trail.isReview) {
      Some(ReviewKicker)
    } else {
      None
    }
  }
}

case class Series(name: String, url: String)

sealed trait ItemKicker

case object BreakingNewsKicker extends ItemKicker
case object LiveKicker extends ItemKicker
case object AnalysisKicker extends ItemKicker
case object ReviewKicker extends ItemKicker
case class PodcastKicker(series: Option[Series]) extends ItemKicker
case class TagKicker(name: String, url: String) extends ItemKicker
case class SectionKicker(name: String, url: String) extends ItemKicker
case class FreeHtmlKicker(body: String) extends ItemKicker
