package views.support

import model.Config

object FindStyle {

  /**
   * Mapping of collection 'type' to Style - in general, this should suffice
   */
  val generalStyles: Map[String, Style] = Map(
    "epic-story" -> Masthead,
    "major-story" -> Masthead,
    "regular-stories" -> TopStories,
    "lesser-stories" -> MediumStories,
    "other-stories" -> SmallStories,
    "featured-stories" -> Highlights
  )

  /**
   * Allows use of different styles on specific fronts for specific collection
   */
  val specificStyles: Map[String, Map[String, Style]] = Map(
    ("uk", Map(
      ("uk/sport/regular-stories", Highlights),
      ("uk/commentisfree/regular-stories", Highlights),
      ("uk/culture/regular-stories", Highlights),
      ("uk/business/regular-stories", Highlights),
      ("uk/lifeandstyle/regular-stories", Highlights),
      ("uk/technology/regular-stories", Highlights),
      ("uk/money/regular-stories", Highlights),
      ("uk/travel/regular-stories", Highlights)
    ))
  )

  def apply(path: String, config: Config): Style = {
    // first check if we have a specific style
    specificStyles.get(path).flatMap { frontStyles =>
      frontStyles.get(config.id)
    }.getOrElse {
      // else use general, defaulting to Highlights
      generalStyles.get(config.id.split("/").last).getOrElse(Highlights)
    }
  }

}
