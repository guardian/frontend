package model.pressed

import com.gu.facia.api.{utils => fapiutils}

object ItemKicker {
  def make(kicker: fapiutils.ItemKicker): ItemKicker = {
    val properties = KickerProperties.make(kicker)
    kicker match {
      case fapiutils.BreakingNewsKicker                => BreakingNewsKicker
      case fapiutils.LiveKicker                        => LiveKicker
      case fapiutils.AnalysisKicker                    => AnalysisKicker
      case fapiutils.ReviewKicker                      => ReviewKicker
      case fapiutils.CartoonKicker                     => CartoonKicker
      case fapiutils.PodcastKicker(series)             => PodcastKicker(properties, Series.make(series))
      case fapiutils.TagKicker(name, url, id)          => TagKicker(properties, name, url, id)
      case fapiutils.SectionKicker(name, url)          => SectionKicker(properties, name, url)
      case fapiutils.FreeHtmlKicker(body)              => FreeHtmlKicker(properties, body)
      case fapiutils.FreeHtmlKickerWithLink(body, url) => FreeHtmlKickerWithLink(properties, body, url)
    }
  }
  def makeTagKicker(kicker: fapiutils.TagKicker): TagKicker =
    TagKicker(
      properties = KickerProperties.make(kicker),
      name = kicker.name,
      url = kicker.url,
      id = kicker.id,
    )
}

sealed trait ItemKicker {
  def properties: KickerProperties
}

case object BreakingNewsKicker extends ItemKicker {
  override val properties = KickerProperties.make(fapiutils.BreakingNewsKicker)
}
case object LiveKicker extends ItemKicker {
  override val properties = KickerProperties.make(fapiutils.LiveKicker)
}
case object AnalysisKicker extends ItemKicker {
  override val properties = KickerProperties.make(fapiutils.AnalysisKicker)
}
case object ReviewKicker extends ItemKicker {
  override val properties = KickerProperties.make(fapiutils.ReviewKicker)
}
case object CartoonKicker extends ItemKicker {
  override val properties = KickerProperties.make(fapiutils.CartoonKicker)
}

final case class PodcastKicker(override val properties: KickerProperties, series: Option[Series]) extends ItemKicker

final case class TagKicker(override val properties: KickerProperties, name: String, url: String, id: String)
    extends ItemKicker

final case class SectionKicker(override val properties: KickerProperties, name: String, url: String) extends ItemKicker

final case class FreeHtmlKicker(override val properties: KickerProperties, body: String) extends ItemKicker

final case class FreeHtmlKickerWithLink(override val properties: KickerProperties, body: String, url: String)
    extends ItemKicker
