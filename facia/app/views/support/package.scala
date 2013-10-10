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
    "feature-stories" -> SectionZone(tone = "feature", showMore = true),
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
      ("au/business/regular-stories", SectionZone(showMore = true)),
      ("au/lifeandstyle/regular-stories", SectionZone(tone = "feature", showMore = true)),
      ("au/technology/regular-stories", SectionZone(showMore = true)),
      ("au/money/regular-stories", SectionZone(showMore = true)),
      ("au/travel/regular-stories", SectionZone(tone = "feature", showMore = true))
    )),
    ("au/commentisfree", Map(
      ("au/commentisfree/regular-stories", Container(tone = "comment"))
    )),
    ("au/culture", Map(
      ("au/culture/regular-stories", Container(tone = "feature", showMore = true)),
      ("au/film/regular-stories", SectionZone(tone = "feature", showMore = true)),
      ("au/music/regular-stories", SectionZone(tone = "feature", showMore = true)),
      ("au/books/regular-stories", SectionZone(tone = "feature", showMore = true)),
      ("au/technology/games/regular-stories", SectionZone(showMore = true))
    )),
    ("au/sport", Map(
      ("au/sport/regular-stories", Container(showMore = true)),
      ("au/football/regular-stories", SectionZone(showMore = true)),
      ("au/sport/cricket/regular-stories", SectionZone(showMore = true)),
      ("au/sport/afl/regular-stories", SectionZone(showMore = true)),
      ("au/sport/nrl/regular-stories", SectionZone(showMore = true)),
      ("au/sport/rugby-union/regular-stories", SectionZone(showMore = true)),
      ("au/sport/tennis/regular-stories", SectionZone(showMore = true)),
      ("au/sport/golf/regular-stories", SectionZone(showMore = true)),
      ("au/sport/motorsports/regular-stories", SectionZone(showMore = true)),
      ("au/sport/cycling/regular-stories", SectionZone(showMore = true)),
      ("au/sport/us-sport/regular-stories", SectionZone(showMore = true)),
      ("au/sport/boxing/regular-stories", SectionZone(showMore = true)),
      ("au/football/a-league/regular-stories", SectionZone(showMore = true)),
      ("au/sport/rugbyleague/regular-stories", SectionZone(showMore = true))
    )),
    ("uk", Map(
      ("uk/news/regular-stories", Container(showMore = true)),
      ("uk/sport/regular-stories", Container(containerType = "sport", showMore = true)),
      ("uk/commentisfree/regular-stories", Container(containerType = "commentisfree", tone = "comment", showMore = true)),
      ("uk/culture/regular-stories", Container(containerType = "culture", tone = "feature", showMore = true)),
      ("uk/business/regular-stories", SectionZone(showMore = true)),
      ("uk/lifeandstyle/regular-stories", SectionZone(tone = "feature", showMore = true)),
      ("uk/technology/regular-stories", SectionZone(showMore = true)),
      ("uk/money/regular-stories", SectionZone(showMore = true)),
      ("uk/travel/regular-stories", SectionZone(tone = "feature", showMore = true))
    )),
    ("uk/commentisfree", Map(
      ("uk/commentisfree/regular-stories", Container(tone = "comment"))
    )),
    ("uk/culture", Map(
      ("uk/culture/regular-stories", Container(tone = "feature", showMore = true)),
      ("uk/tv-and-radio/regular-stories", SectionZone(tone = "feature", showMore = true)),
      ("uk/film/regular-stories", SectionZone(tone = "feature", showMore = true)),
      ("uk/music/regular-stories", SectionZone(tone = "feature", showMore = true)),
      ("uk/stage/regular-stories", SectionZone(tone = "feature", showMore = true)),
      ("uk/books/regular-stories", SectionZone(tone = "feature", showMore = true)),
      ("uk/artanddesign/regular-stories", SectionZone(tone = "feature", showMore = true)),
      ("uk/technology/games/regular-stories", SectionZone(showMore = true))
    )),
    ("uk/sport", Map(
      ("uk/sport/regular-stories", Container(showMore = true)),
      ("uk/football/regular-stories", SectionZone(showMore = true)),
      ("uk/sport/cricket/regular-stories", SectionZone(showMore = true)),
      ("uk/sport/rugby-union/regular-stories", SectionZone(showMore = true)),
      ("uk/sport/motorsports/regular-stories", SectionZone(showMore = true)),
      ("uk/sport/tennis/regular-stories", SectionZone(showMore = true)),
      ("uk/sport/golf/regular-stories", SectionZone(showMore = true)),
      ("uk/sport/horse-racing/regular-stories", SectionZone(showMore = true)),
      ("uk/sport/rugbyleague/regular-stories", SectionZone(showMore = true)),
      ("uk/sport/us-sport/regular-stories", SectionZone(showMore = true)),
      ("uk/sport/boxing/regular-stories", SectionZone(showMore = true)),
      ("uk/sport/cycling/regular-stories", SectionZone(showMore = true))
    )),
    ("us", Map(
      ("us/news/regular-stories", Container(showMore = true)),
      ("us/sport/regular-stories", Container(containerType = "sport", showMore = true)),
      ("us/commentisfree/regular-stories", Container(containerType = "commentisfree", tone = "comment", showMore = true)),
      ("us/culture/regular-stories", Container(containerType = "culture", tone = "feature", showMore = true)),
      ("us/business/regular-stories", SectionZone(showMore = true)),
      ("us/lifeandstyle/regular-stories", SectionZone(tone = "feature", showMore = true)),
      ("us/technology/regular-stories", SectionZone(showMore = true)),
      ("us/money/regular-stories", SectionZone(showMore = true)),
      ("us/travel/regular-stories", SectionZone(tone = "feature", showMore = true))
    )),
    ("us/commentisfree", Map(
      ("us/commentisfree/regular-stories", Container(tone = "comment"))
    )),
    ("us/culture", Map(
      ("us/culture/regular-stories", Container(tone = "feature", showMore = true)),
      ("us/film/regular-stories", SectionZone(tone = "feature", showMore = true)),
      ("us/music/regular-stories", SectionZone(tone = "feature", showMore = true)),
      ("us/stage/regular-stories", SectionZone(tone = "feature", showMore = true)),
      ("us/books/regular-stories", SectionZone(tone = "feature", showMore = true)),
      ("us/artanddesign/regular-stories", SectionZone(tone = "feature", showMore = true)),
      ("us/technology/games/regular-stories", SectionZone(showMore = true)),
      ("us/tv-and-radio/regular-stories", SectionZone(tone = "feature", showMore = true))
    )),
    ("us/sport", Map(
      ("us/sport/regular-stories", Container( showMore = true)),
      ("us/sport/nfl/regular-stories", SectionZone(showMore = true)),
      ("us/sport/mlb/regular-stories", SectionZone(showMore = true)),
      ("us/sport/nba/regular-stories", SectionZone(showMore = true)),
      ("us/sport/mls/regular-stories", SectionZone(showMore = true)),
      ("us/sport/nhl/regular-stories", SectionZone(showMore = true))
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
