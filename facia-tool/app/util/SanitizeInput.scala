package util

import com.gu.facia.client.models.{Config, Front}
import scala.util.matching.Regex


object SanitizeInput {

  val sanitizeRegex: Regex = "(<.*?>|<[^>]*$)".r

  def fromString(s: String) = sanitizeRegex.replaceAllIn(s, "")

  def fromConfigSeo(config: Config): Config = {
    config.copy(fronts = config.fronts.mapValues(sanitizeSeoInputFromFront))
  }

  private def sanitizeSeoInputFromFront(front: Front): Front = front.copy(
      title = front.title.map(fromString),
      webTitle = front.webTitle.map(fromString),
      navSection = front.navSection.map(fromString),
      description = front.description.map(fromString))
}
