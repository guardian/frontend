package views.support

import com.gu.facia.client.models.{CollectionConfigJson => CollectionConfig}
import model.{Trail, Tag}

object ItemKicker {
  private def firstTag(item: Trail): Option[Tag] = item.tags.headOption

  def fromTrail(trail: Trail, config: Option[CollectionConfig]): Option[ItemKicker] = {
    lazy val maybeTag = firstTag(trail)

    def tagKicker = maybeTag.map(TagKicker.fromTag)

    def sectionKicker = Some(SectionKicker(trail.sectionName.capitalize, "/" + trail.section))

    trail.customKicker match {
      case Some(kicker)
        if trail.snapType.contains("latest") &&
          trail.showKickerCustom &&
          trail.snapUri.isDefined => Some(FreeHtmlKickerWithLink(kicker, s"/${trail.snapUri.get}"))
      case Some(kicker) if trail.showKickerCustom => Some(FreeHtmlKicker(kicker))
      case _ => if (trail.isBreaking) {
        Some(BreakingNewsKicker)
      } else if (trail.showKickerTag && maybeTag.isDefined) {
        tagKicker
      } else if (trail.showKickerSection) {
        sectionKicker
      } else if (config.exists(_.showTags.exists(identity)) && maybeTag.isDefined) {
        tagKicker
      } else if (config.exists(_.showSections.exists(identity))) {
        sectionKicker
      } else if (!config.exists(_.hideKickers.exists(identity))) {
        tonalKicker(trail)
      } else {
        None
      }
    }
  }

  private def tonalKicker(trail: Trail): Option[ItemKicker] = {
    if (trail.isLive) {
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
    } else if (trail.isCartoon) {
      Some(CartoonKicker)
    } else {
      None
    }
  }

  val TagsThatDoNotAutoKicker = Set(
    "commentisfree/commentisfree"
  )

  def seriesOrBlogKicker(item: Trail) =
    item.tags.find({ tag =>
      Set("series", "blog").contains(tag.tagType) && !TagsThatDoNotAutoKicker.contains(tag.id)
    }).map(TagKicker.fromTag)

  /** Used for de-duping bylines */
  def kickerText(itemKicker: ItemKicker): Option[String] = itemKicker match {
    case PodcastKicker(Some(series)) => Some(series.name)
    case TagKicker(name, _, _) => Some(name)
    case SectionKicker(name, _) => Some(name)
    case FreeHtmlKicker(body) => Some(body)
    case FreeHtmlKickerWithLink(body, _) => Some(body)
    case _ => None
  }
}

case class Series(name: String, url: String)

sealed trait ItemKicker {
  val sublinkClasses: Set[String]

  val linkClasses: Set[String]

  val kickerHtml: String

  def sublinkKickerHtml: String = kickerHtml

  val link: Option[String]
}

case object BreakingNewsKicker extends ItemKicker {
  override val sublinkClasses = Set(
    "fc-sublink__kicker",
    "fc-sublink__live-indicator"
  )

  override val linkClasses: Set[String] = Set(
    "fc-item__kicker",
    "fc-item__kicker--breaking-news"
  )

  override val kickerHtml = "Breaking news"

  override val link = None
}

case object LiveKicker extends ItemKicker {
  override val sublinkClasses: Set[String] = Set(
    "fc-sublink__kicker",
    "fc-sublink__live-indicator"
  )

  override val linkClasses: Set[String] = Set(
    "fc-item__kicker",
    "fc-item__live-indicator"
  )

  override val kickerHtml = "<span class=\"live-pulse-icon\"></span>Live"

  override def sublinkKickerHtml: String = "Live"

  override val link = None
}

case object AnalysisKicker extends ItemKicker {
  override val sublinkClasses = Set(
    "fc-sublink__kicker"
  )

  override val linkClasses: Set[String] = Set(
    "fc-item__kicker"
  )

  override val kickerHtml = "Analysis"

  override val link = None
}

case object ReviewKicker extends ItemKicker {
  override val sublinkClasses = Set(
    "fc-sublink__kicker"
  )

  override val linkClasses = Set(
    "fc-item__kicker"
  )

  override val kickerHtml = "Review"

  override val link = None
}

case object CartoonKicker extends ItemKicker {
  override val sublinkClasses = Set(
    "fc-sublink__kicker"
  )

  override val linkClasses = Set(
    "fc-item__kicker"
  )

  override val kickerHtml = "Cartoon"

  override val link = None
}

case class PodcastKicker(series: Option[Series]) extends ItemKicker {
  override val sublinkClasses = Set(
    "fc-sublink__kicker"
  )

  override val linkClasses = Set(
    "fc-item__kicker"
  )

  override val kickerHtml = series.map(_.name).getOrElse("Podcast")

  override val link = series.map(_.url)
}

object TagKicker {
  def fromTag(tag: Tag) = TagKicker(tag.name, tag.webUrl, tag.id)
}

case class TagKicker(name: String, url: String, id: String) extends ItemKicker {
  override val sublinkClasses = Set(
    "fc-sublink__kicker"
  )

  override val linkClasses = Set(
    "fc-item__kicker"
  )

  override val kickerHtml: String = name

  override val link = Some(url)
}

case class SectionKicker(name: String, url: String) extends ItemKicker {
  override val sublinkClasses = Set(
    "fc-sublink__kicker"
  )

  override val linkClasses = Set(
    "fc-item__kicker"
  )
  override val kickerHtml: String = name

  override val link = Some(url)
}

case class FreeHtmlKicker(body: String) extends ItemKicker {
  override val sublinkClasses = Set(
    "fc-sublink__kicker"
  )

  override val linkClasses = Set(
    "fc-item__kicker"
  )

  override val kickerHtml: String = body

  override val link = None
}

case class FreeHtmlKickerWithLink(body: String, url: String) extends ItemKicker {
  override val sublinkClasses = Set(
    "fc-sublink__kicker"
  )

  override val linkClasses = Set(
    "fc-item__kicker"
  )

  override val kickerHtml: String = body

  override val link = Some(url)
}

