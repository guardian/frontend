package views.support

import common.LinkTo
import model.{Content, Trail, Tag}
import play.api.mvc.RequestHeader
import Function.const

object ItemKicker {
  private def firstTag(item: Trail): Option[Tag] = item.tags.headOption

  def text(item: Trail, config: model.Config) =
    firstTag(item) match {
      case _ if item.isBreaking => Some("Breaking News")
      case _ if item.isLive => Some("Live")
      case Some(tag) if config.showTags => Some(tag.name)
      case _ if config.showSections => Some(item.sectionName.capitalize)
      case _ => None
    }

  def url(item: Trail, config: model.Config): Option[String] =
    firstTag(item).map(_.webUrl).filter(const(config.showTags)) orElse
      (item match {
        case c: Content => Some(c.section)
        case _ => None
      }).filter(const(config.showSections))

  def linkTo(item: Trail, config: model.Config)(implicit requestHeader: RequestHeader) =
    url(item, config) map { urlString =>
      "/" + LinkTo(urlString)
    }
}
