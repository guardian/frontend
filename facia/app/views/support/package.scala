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
      ("uk/sport/regular-stories", MediumStories),
      ("uk/commentisfree/regular-stories", Features),
      ("uk/culture/regular-stories", Features),
      ("uk/business/regular-stories", MediumStories),
      ("uk/lifeandstyle/regular-stories", Features),
      ("uk/technology/regular-stories", Features),
      ("uk/money/regular-stories", MediumStories),
      ("uk/travel/regular-stories", Features)
    )),
    ("us", Map(
      ("us/sport/regular-stories", MediumStories),
      ("us/commentisfree/regular-stories", Features),
      ("us/culture/regular-stories", Features),
      ("us/business/regular-stories", MediumStories),
      ("us/lifeandstyle/regular-stories", Features),
      ("us/technology/regular-stories", Features),
      ("us/money/regular-stories", MediumStories),
      ("us/travel/regular-stories", Features)
    )),
    ("au", Map(
      ("au/sport/regular-stories", MediumStories),
      ("au/commentisfree/regular-stories", Features),
      ("au/culture/regular-stories", Features),
      ("au/business/regular-stories", MediumStories),
      ("au/lifeandstyle/regular-stories", Features),
      ("au/technology/regular-stories", Features),
      ("au/money/regular-stories", MediumStories),
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
