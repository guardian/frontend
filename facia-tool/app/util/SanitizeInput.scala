package util

import com.gu.facia.client.models.{ConfigJson, FrontJson}
import scala.util.matching.Regex

object SanitizeInput {
  val sanitizeRegex: Regex = "(<.*?>|<[^>]*$)".r

  def fromString(s: String) = sanitizeRegex.replaceAllIn(s, "")

  def fromConfigSeo(config: ConfigJson): ConfigJson = {
    config.copy(fronts = config.fronts.mapValues(sanitizeSeoInputFromFront))
  }

  private def sanitizeSeoInputFromFront(front: FrontJson): FrontJson = front.copy(
      title = front.title.map(fromString),
      webTitle = front.webTitle.map(fromString),
      navSection = front.navSection.map(fromString),
      description = front.description.map(fromString))
}
