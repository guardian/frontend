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
    "feature-stories" -> Features,
    "highlight-stories" -> Highlights
  )

  /**
   * Allows use of different styles on specific fronts for specific collection
   */
  val specificStyles: Map[String, Map[String, Style]] = Map(
    ("uk", Map(
      ("uk/sport/regular-stories", News),
      ("uk/commentisfree/regular-stories", Comments),
      ("uk/culture/regular-stories", Features),
      ("uk/business/regular-stories", News),
      ("uk/lifeandstyle/regular-stories", Features),
      ("uk/technology/regular-stories", Features),
      ("uk/money/regular-stories", News),
      ("uk/travel/regular-stories", Features)
    )),
    ("us", Map(
      ("us/sport/regular-stories", News),
      ("us/commentisfree/regular-stories", Comments),
      ("us/culture/regular-stories", Features),
      ("us/business/regular-stories", News),
      ("us/lifeandstyle/regular-stories", Features),
      ("us/technology/regular-stories", Features),
      ("us/money/regular-stories", News),
      ("us/travel/regular-stories", Features)
    )),
    ("au", Map(
      ("au/sport/regular-stories", News),
      ("au/commentisfree/regular-stories", Comments),
      ("au/culture/regular-stories", Features),
      ("au/business/regular-stories", News),
      ("au/lifeandstyle/regular-stories", Features),
      ("au/technology/regular-stories", Features),
      ("au/money/regular-stories", News),
      ("au/travel/regular-stories", Features)
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
