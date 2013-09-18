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
      ("uk/sport/regular-stories", Highlights),
      ("uk/commentisfree/regular-stories", Features),
      ("uk/culture/regular-stories", Features),
      ("uk/business/regular-stories", Highlights),
      ("uk/lifeandstyle/regular-stories", Highlights),
      ("uk/technology/regular-stories", Highlights),
      ("uk/money/regular-stories", Highlights),
      ("uk/travel/regular-stories", Highlights)
    )),
    ("us", Map(
      ("us/sport/regular-stories", Highlights),
      ("us/commentisfree/regular-stories", Features),
      ("us/culture/regular-stories", Features),
      ("us/business/regular-stories", Highlights),
      ("us/lifeandstyle/regular-stories", Highlights),
      ("us/technology/regular-stories", Highlights),
      ("us/money/regular-stories", Highlights),
      ("us/travel/regular-stories", Highlights)
    )),
    ("au", Map(
      ("au/sport/regular-stories", Highlights),
      ("au/commentisfree/regular-stories", Features),
      ("au/culture/regular-stories", Features),
      ("au/business/regular-stories", Highlights),
      ("au/lifeandstyle/regular-stories", Highlights),
      ("au/technology/regular-stories", Highlights),
      ("au/money/regular-stories", Highlights),
      ("au/travel/regular-stories", Highlights)
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
