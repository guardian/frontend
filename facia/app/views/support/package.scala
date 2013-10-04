package views.support

import model.Config

object FindStyle {

  /**
   * Mapping of collection 'type' to Style - in general, this should suffice
   */
  val generalStyles: Map[String, Style] = Map(
    "epic-story" -> Masthead,
    "major-story" -> Masthead,
    "regular-stories" -> Container("news"),
    "feature-stories" -> SectionZone(collectionType = "features"),
    "special-story" -> SectionZone()
  )

  /**
   * Allows use of different styles on specific fronts for specific collection
   */
  val specificStyles: Map[String, Map[String, Style]] = Map(
    ("au", Map(
      ("au/news/regular-stories", Container("news", showMore = true)),
      ("au/sport/regular-stories", Container("sport", showMore = true)),
      ("au/commentisfree/regular-stories", Container("comments", showMore = true)),
      ("au/culture/regular-stories", Container("culture", showMore = true)),
      ("au/business/regular-stories", SectionZone()),
      ("au/lifeandstyle/regular-stories", SectionZone(collectionType = "features")),
      ("au/technology/regular-stories", SectionZone(collectionType = "features")),
      ("au/money/regular-stories", SectionZone()),
      ("au/travel/regular-stories", SectionZone(collectionType = "features"))
    )),
    ("au/culture", Map(
      ("au/culture/regular-stories", Container("news", showMore = true)),
      ("au/film/regular-stories", SectionZone(collectionType = "features")),
      ("au/music/regular-stories", SectionZone(collectionType = "features")),
      ("au/books/regular-stories", SectionZone(collectionType = "features")),
      ("au/technology/games/regular-stories", SectionZone(collectionType = "features"))
    )),
    ("au/sport", Map(
      ("au/sport/regular-stories", Container("news", showMore = true)),
      ("au/football/regular-stories", SectionZone()),
      ("au/sport/cricket/regular-stories", SectionZone()),
      ("au/sport/afl/regular-stories", SectionZone()),
      ("au/sport/nrl/regular-stories", SectionZone()),
      ("au/sport/rugby-union/regular-stories", SectionZone()),
      ("au/sport/tennis/regular-stories", SectionZone()),
      ("au/sport/golf/regular-stories", SectionZone()),
      ("au/sport/motorsports/regular-stories", SectionZone()),
      ("au/sport/cycling/regular-stories", SectionZone()),
      ("au/sport/us-sport/regular-stories", SectionZone()),
      ("au/sport/boxing/regular-stories", SectionZone())
    )),
    ("uk", Map(
      ("uk/news/regular-stories", Container("news", showMore = true)),
      ("uk/sport/regular-stories", Container("sport", showMore = true)),
      ("uk/commentisfree/regular-stories", Container("comments", showMore = true)),
      ("uk/culture/regular-stories", Container("culture", showMore = true)),
      ("uk/business/regular-stories", SectionZone()),
      ("uk/lifeandstyle/regular-stories", SectionZone(collectionType = "features")),
      ("uk/technology/regular-stories", SectionZone(collectionType = "features")),
      ("uk/money/regular-stories", SectionZone()),
      ("uk/travel/regular-stories", SectionZone(collectionType = "features"))
    )),
    ("uk/culture", Map(
      ("uk/culture/regular-stories", Container("news", showMore = true)),
      ("uk/tv-and-radio/regular-stories", SectionZone(collectionType = "features")),
      ("uk/film/regular-stories", SectionZone(collectionType = "features")),
      ("uk/music/regular-stories", SectionZone(collectionType = "features")),
      ("uk/stage/regular-stories", SectionZone(collectionType = "features")),
      ("uk/books/regular-stories", SectionZone(collectionType = "features")),
      ("uk/artanddesign/regular-stories", SectionZone(collectionType = "features")),
      ("uk/technology/games/regular-stories", SectionZone(collectionType = "features"))
    )),
    ("uk/sport", Map(
      ("uk/sport/regular-stories", Container("news", showMore = true)),
      ("uk/football/regular-stories", SectionZone()),
      ("uk/sport/cricket/regular-stories", SectionZone()),
      ("uk/sport/rugby-union/regular-stories", SectionZone()),
      ("uk/sport/motorsports/regular-stories", SectionZone()),
      ("uk/sport/tennis/regular-stories", SectionZone()),
      ("uk/sport/golf/regular-stories", SectionZone()),
      ("uk/sport/horse-racing/regular-stories", SectionZone()),
      ("uk/sport/rugbyleague/regular-stories", SectionZone()),
      ("uk/sport/us-sport/regular-stories", SectionZone()),
      ("uk/sport/boxing/regular-stories", SectionZone()),
      ("uk/sport/cycling/regular-stories", SectionZone())
    )),
    ("us", Map(
      ("us/news/regular-stories", Container("news", showMore = true)),
      ("us/sport/regular-stories", Container("sport", showMore = true)),
      ("us/commentisfree/regular-stories", Container("comments", showMore = true)),
      ("us/culture/regular-stories", Container("culture", showMore = true)),
      ("us/business/regular-stories", SectionZone()),
      ("us/lifeandstyle/regular-stories", SectionZone(collectionType = "features")),
      ("us/technology/regular-stories", SectionZone(collectionType = "features")),
      ("us/money/regular-stories", SectionZone()),
      ("us/travel/regular-stories", SectionZone(collectionType = "features"))
    )),
    ("us/culture", Map(
      ("us/culture/regular-stories", Container("news", showMore = true)),
      ("us/film/regular-stories", SectionZone(collectionType = "features")),
      ("us/music/regular-stories", SectionZone(collectionType = "features")),
      ("us/stage/regular-stories", SectionZone(collectionType = "features")),
      ("us/books/regular-stories", SectionZone(collectionType = "features")),
      ("us/artanddesign/regular-stories", SectionZone(collectionType = "features")),
      ("us/technology/games/regular-stories", SectionZone(collectionType = "features")),
      ("us/tv-and-radio/regular-stories", SectionZone(collectionType = "features"))
    )),
    ("us/sport", Map(
      ("us/sport/regular-stories", Container("news", showMore = true)),
      ("us/sport/nfl/regular-stories", SectionZone()),
      ("us/sport/mlb/regular-stories", SectionZone()),
      ("us/sport/nba/regular-stories", SectionZone()),
      ("us/sport/mls/regular-stories", SectionZone()),
      ("us/sport/nhl/regular-stories", SectionZone())
    ))
  )

  def apply(path: String, config: Config): Style = {
    // first check if we have a specific style
    specificStyles.get(path).flatMap { frontStyles =>
      frontStyles.get(config.id)
    }.getOrElse {
      // else use general, defaulting to Highlights
      generalStyles.get(config.id.split("/").last).getOrElse(SectionZone())
    }
  }

}
