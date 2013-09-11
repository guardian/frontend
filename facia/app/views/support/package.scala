package views.support

import model.Config

object FindStyle {

  /**
   * Mapping of roleName of collection to Style - in greneral, this should suffice
   */
  val generalStyles: Map[String, Style] = Map(
    "epic-story" -> Masthead,
    "major-story" -> Masthead,
    "regular-stories" -> TopStories,
    "lesser-stories" -> MediumStories,
    "other-stories" -> SmallStories,
    "featured-stories" -> Highlights,
    "section-stories" -> Highlights
  )

  /**
   * Allows use of different styles on specific fronts for specific collection
   */
  val specificStyles: Map[String, Map[String, Style]] = Map(
    ("uk", Map(
      ("uk/travel/regular-stories", Masthead)
    ))
  )

  def apply(path: String, config: Config): Style = {
    val collectionType = config.id.split("/").last
    // first check if we have a specific style
    specificStyles.get(path).flatMap { frontStyles =>
      frontStyles.get(collectionType)
    }.getOrElse {
      // else use general, defaulting to Highlights
      generalStyles.get(collectionType).getOrElse(Highlights)
    }
  }

}
