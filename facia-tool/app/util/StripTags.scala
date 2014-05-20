package util

import frontsapi.model.{Front, Config}
import scala.util.matching.Regex


object StripTags {

  val stripRegex: Regex = "(.*)|(.*)".r

  def stripTagsFromConfigSeo(config: Config): Config = {
    config.copy(fronts = config.fronts.mapValues(stripTagsFromFront))
  }

  private def stripTagsFromFront(front: Front): Front =
    front.copy(
      title       = front.title.map(stripTags),
      webTitle    = front.webTitle.map(stripTags),
      section     = front.section.map(stripTags),
      description = front.description.map(stripTags)
    )

  private def stripTags(s: String) = s match {
    case stripRegex(groupOne, groupTwo) => s
    case _ => s
  }

}
