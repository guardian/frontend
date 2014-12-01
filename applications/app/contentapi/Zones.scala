package contentapi

import common.Edition
import conf.{Switches, LiveContentApi}
import Function.const

/** There's a concept of 'zones' in R2, which isn't current reflected in Content API. If you look at the 'sport' or
  * 'culture' section, you actually see an amalgamation of several other sections.
  */
object Zones {
  val ById: Map[String, Zone] = Map(
    "sport" -> Zone("Sport", Seq(
      "sport",
      "football"
    )),
    "culture" -> Zone("Culture", Seq(
      "culture",
      "film",
      "music",
      "books",
      "stage",
      "tv-and-radio",               // <-
      "artanddesign"                // <-  LOL WHAT
    ))
  )

  private def sectionTagId(sectionId: String) = s"$sectionId/$sectionId"

  def queryById(id: String, edition: Edition): Either[WebTitleAndQuery, LiveContentApi.ItemQuery] = {
    Paths.withoutEdition(id).flatMap(ById.get)
      .filter(const(Switches.ZonesAggregationSwitch.isSwitchedOn)) map { case Zone(webTitle, sections) =>
      Left(WebTitleAndQuery(webTitle, LiveContentApi.search(edition).tag(sections.map(sectionTagId).mkString("|"))))
    } getOrElse {
      Right(LiveContentApi.item(id, edition))
    }
  }
}

case class WebTitleAndQuery(webTitle: String, query: LiveContentApi.SearchQuery)

case class Zone(webTitle: String, sections: Seq[String])
