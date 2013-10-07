package views.support

import model.Config

object FindStyle {

  /**
   * Mapping of collection 'type' to Style - in general, this should suffice
   */
  val generalStyles: Map[String, Style] = Map(
    "epic-story" -> Masthead,
    "major-story" -> Masthead,
    "regular-stories" -> Container(),
    "feature-stories" -> SectionZone(tone = "feature"),
    "special-story" -> SectionZone()
  )

  /**
   * Allows use of different styles on specific fronts for specific collection
   */
  val specificStyles: Map[String, Map[String, Style]] = Map(
    ("au", Map(
      ("au/news/regular-stories", Container(showMore = true)),
      ("au/sport/regular-stories", Container(containerType = "sport", showMore = true)),
      ("au/commentisfree/regular-stories", Container(containerType = "commentisfree", tone = "comment", showMore = true)),
      ("au/culture/regular-stories", Container(containerType = "culture", tone = "feature", showMore = true)),
      ("au/business/regular-stories", SectionZone()),
      ("au/lifeandstyle/regular-stories", SectionZone(tone = "feature")),
      ("au/technology/regular-stories", SectionZone()),
      ("au/money/regular-stories", SectionZone()),
      ("au/travel/regular-stories", SectionZone(tone = "feature"))
    )),
    ("au/commentisfree", Map(
      ("au/commentisfree/regular-stories", Container(tone = "comment"))
    )),
    ("au/culture", Map(
      ("au/culture/regular-stories", Container(tone = "feature", showMore = true)),
      ("au/film/regular-stories", SectionZone(tone = "feature")),
      ("au/music/regular-stories", SectionZone(tone = "feature")),
      ("au/books/regular-stories", SectionZone(tone = "feature")),
      ("au/technology/games/regular-stories", SectionZone())
    )),
    ("au/sport", Map(
      ("au/sport/regular-stories", Container(showMore = true)),
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
      ("uk/news/regular-stories", Container(showMore = true)),
      ("uk/sport/regular-stories", Container(containerType = "sport", showMore = true)),
      ("uk/commentisfree/regular-stories", Container(containerType = "commentisfree", tone = "comment", showMore = true)),
      ("uk/culture/regular-stories", Container(containerType = "culture", tone = "feature", showMore = true)),
      ("uk/business/regular-stories", SectionZone()),
      ("uk/lifeandstyle/regular-stories", SectionZone(tone = "feature")),
      ("uk/technology/regular-stories", SectionZone()),
      ("uk/money/regular-stories", SectionZone()),
      ("uk/travel/regular-stories", SectionZone(tone = "feature"))
    )),
    ("uk/commentisfree", Map(
      ("uk/commentisfree/regular-stories", Container(tone = "comment"))
    )),
    ("uk/culture", Map(
      ("uk/culture/regular-stories", Container(tone = "feature", showMore = true)),
      ("uk/tv-and-radio/regular-stories", SectionZone(tone = "feature")),
      ("uk/film/regular-stories", SectionZone(tone = "feature")),
      ("uk/music/regular-stories", SectionZone(tone = "feature")),
      ("uk/stage/regular-stories", SectionZone(tone = "feature")),
      ("uk/books/regular-stories", SectionZone(tone = "feature")),
      ("uk/artanddesign/regular-stories", SectionZone(tone = "feature")),
      ("uk/technology/games/regular-stories", SectionZone())
    )),
    ("uk/sport", Map(
      ("uk/sport/regular-stories", Container(showMore = true)),
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
      ("us/news/regular-stories", Container(showMore = true)),
      ("us/sport/regular-stories", Container(containerType = "sport", showMore = true)),
      ("us/commentisfree/regular-stories", Container(containerType = "commentisfree", tone = "comment", showMore = true)),
      ("us/culture/regular-stories", Container(containerType = "culture", tone = "feature", showMore = true)),
      ("us/business/regular-stories", SectionZone()),
      ("us/lifeandstyle/regular-stories", SectionZone(tone = "feature")),
      ("us/technology/regular-stories", SectionZone()),
      ("us/money/regular-stories", SectionZone()),
      ("us/travel/regular-stories", SectionZone(tone = "feature"))
    )),
    ("us/commentisfree", Map(
      ("us/commentisfree/regular-stories", Container(tone = "comment"))
    )),
    ("us/culture", Map(
      ("us/culture/regular-stories", Container(tone = "feature", showMore = true)),
      ("us/film/regular-stories", SectionZone(tone = "feature")),
      ("us/music/regular-stories", SectionZone(tone = "feature")),
      ("us/stage/regular-stories", SectionZone(tone = "feature")),
      ("us/books/regular-stories", SectionZone(tone = "feature")),
      ("us/artanddesign/regular-stories", SectionZone(tone = "feature")),
      ("us/technology/games/regular-stories", SectionZone()),
      ("us/tv-and-radio/regular-stories", SectionZone(tone = "feature"))
    )),
    ("us/sport", Map(
      ("us/sport/regular-stories", Container( showMore = true)),
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
