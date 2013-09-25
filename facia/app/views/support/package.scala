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
    "other-stories" -> SmallStories(showMore = true),
    "feature-stories" -> Features,
    "highlight-stories" -> Highlights
  )

  /**
   * Allows use of different styles on specific fronts for specific collection
   */
  val specificStyles: Map[String, Map[String, Style]] = Map(
    ("au", Map(
      ("au/sport/regular-stories", News),
      ("au/commentisfree/regular-stories", Comments),
      ("au/culture/regular-stories", Features),
      ("au/business/regular-stories", News),
      ("au/lifeandstyle/regular-stories", Features),
      ("au/technology/regular-stories", Features),
      ("au/money/regular-stories", News),
      ("au/travel/regular-stories", Features)
    )),
    ("au/business", Map(
      ("au/business/other-stories", SmallStories())
    )),
    ("au/commentisfree", Map(
      ("au/commentisfree/other-stories", SmallStories())
    )),
    ("au/culture", Map(
      ("au/film/regular-stories", Features),
      ("au/music/regular-stories", Features),
      ("au/books/regular-stories", Features),
      ("au/technology/games/regular-stories", Features)
    )),
    ("au/money", Map(
      ("au/money/other-stories", SmallStories())
    )),
    ("au/sport", Map(
      ("au/sport/football/regular-stories", News),
      ("au/sport/cricket/regular-stories", News),
      ("au/sport/afl/regular-stories", News),
      ("au/sport/nrl/regular-stories", News),
      ("au/sport/rugby-union/regular-stories", News),
      ("au/sport/tennis/regular-stories", News),
      ("au/sport/golf/regular-stories", News),
      ("au/sport/motorsports/regular-stories", News),
      ("au/sport/cycling/regular-stories", News),
      ("au/sport/us-sport/regular-stories", News),
      ("au/sport/boxing/regular-stories", News)
    )),
    ("uk", Map(
      ("uk/sport/regular-stories", News),
      ("uk/commentisfree/regular-stories", Comments),
      ("uk/culture/regular-stories", Features),
      ("uk/business/regular-stories", MediumStoriesSection()),
      ("uk/lifeandstyle/regular-stories", MediumStoriesSection(collectionType = "features")),
      ("uk/technology/regular-stories", MediumStoriesSection(collectionType = "features")),
      ("uk/money/regular-stories", MediumStoriesSection()),
      ("uk/travel/regular-stories", MediumStoriesSection(collectionType = "features"))
    )),
    ("uk/business", Map(
      ("uk/business/other-stories", SmallStories())
    )),
    ("uk/commentisfree", Map(
      ("uk/commentisfree/other-stories", SmallStories())
    )),
    ("uk/culture", Map(
      ("uk/tv-and-radio/regular-stories", Features),
      ("uk/film/regular-stories", Features),
      ("uk/music/regular-stories", Features),
      ("uk/stage/regular-stories", Features),
      ("uk/books/regular-stories", Features),
      ("uk/artanddesign/regular-stories", Features),
      ("uk/technology/games/regular-stories", Features)
    )),
    ("uk/money", Map(
      ("uk/money/other-stories", SmallStories())
    )),
    ("uk/sport", Map(
      ("uk/sport/football/regular-stories", News),
      ("uk/sport/cricket/regular-stories", News),
      ("uk/sport/rugby-union/regular-stories", News),
      ("uk/sport/motorsports/regular-stories", News),
      ("uk/sport/tennis/regular-stories", News),
      ("uk/sport/golf/regular-stories", News),
      ("uk/sport/horse-racing/regular-stories", News),
      ("uk/sport/rugbyleague/regular-stories", News),
      ("uk/sport/us-sport/regular-stories", News),
      ("uk/sport/boxing/regular-stories", News),
      ("uk/sport/cycling/regular-stories", News)
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
    ("us/business", Map(
      ("us/business/other-stories", SmallStories())
    )),
    ("us/commentisfree", Map(
      ("us/commentisfree/other-stories", SmallStories())
    )),
    ("us/culture", Map(
      ("us/film/regular-stories", Features),
      ("us/music/regular-stories", Features),
      ("us/stage/regular-stories", Features),
      ("us/books/regular-stories", Features),
      ("us/artanddesign/regular-stories", Features),
      ("us/technology/games/regular-stories", Features),
      ("us/tv-and-radio/regular-stories", Features)
    )),
    ("us/money", Map(
      ("us/money/other-stories", SmallStories())
    )),
    ("us/sport", Map(
      ("us/sport/nfl/regular-stories", News),
      ("us/sport/mlb/regular-stories", News),
      ("us/sport/nba/regular-stories", News),
      ("us/sport/mls/regular-stories", News),
      ("us/sport/nhl/regular-stories", News)
    ))
  )

  def apply(path: String, config: Config): Style = {
    // first check if we have a specific style
    specificStyles.get(path).flatMap { frontStyles =>
      frontStyles.get(config.id)
    }.getOrElse {
      // else use general, defaulting to Highlights
      generalStyles.get(config.id.split("/").last).getOrElse(News)
    }
  }

}
