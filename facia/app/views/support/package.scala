package views.support

import model.Config

object FindStyle {

  /**
   * Mapping of collection 'type' to Style - in general, this should suffice
   */
  val generalStyles: Map[String, Container] = Map(
    "regular-stories" -> SectionContainer(),
    "feature-stories" -> FeaturesContainer(headerLink = false),
    "special-story" -> NewsContainer()
  )

  /**
   * Allows use of different styles on specific fronts for specific collection
   */
  val specificStyles: Map[String, Map[String, Container]] = Map(
    ("au", Map(
      ("au/news/regular-stories", NewsContainer()),
      ("au/sport/regular-stories", SportContainer()),
      ("au/commentisfree/regular-stories", CommentContainer()),
      ("au/culture/regular-stories", FeaturesContainer()),
      ("au/contributors/feature-stories", CommentContainer())
    )),
    ("au/business", Map(
      ("au/business/regular-stories", SportContainer(showMore = false))
    )),
    ("au/commentisfree", Map(
      ("au/commentisfree/regular-stories", CommentContainer(showMore = false))
    )),
    ("au/culture", Map(
      ("au/culture/regular-stories", FeaturesContainer()),
      ("au/film/regular-stories", SectionContainer(tone = "feature")),
      ("au/music/regular-stories", SectionContainer(tone = "feature")),
      ("au/books/regular-stories", SectionContainer(tone = "feature"))
    )),
    ("au/money", Map(
      ("au/money/regular-stories", SportContainer(showMore = false))
    )),
    ("au/sport", Map(
      ("au/sport/regular-stories", SportContainer())
    )),
    ("uk", Map(
      ("uk/news/regular-stories", NewsContainer()),
      ("uk/sport/regular-stories", SportContainer()),
      ("uk/commentisfree/regular-stories", CommentContainer()),
      ("uk/culture/regular-stories", FeaturesContainer()),
      ("uk/lifeandstyle/regular-stories", SectionContainer(tone = "feature")),
      ("uk/travel/regular-stories", SectionContainer(tone = "feature")),
      ("uk/contributors/feature-stories", CommentContainer())
    )),
    ("uk/business", Map(
      ("uk/business/regular-stories", SportContainer(showMore = false))
    )),
    ("uk/commentisfree", Map(
      ("uk/commentisfree/regular-stories", CommentContainer(showMore = false))
    )),
    ("uk/culture", Map(
      ("uk/culture/regular-stories", FeaturesContainer()),
      ("uk/tv-and-radio/regular-stories", SectionContainer(tone = "feature")),
      ("uk/film/regular-stories", SectionContainer(tone = "feature")),
      ("uk/music/regular-stories", SectionContainer(tone = "feature")),
      ("uk/stage/regular-stories", SectionContainer(tone = "feature")),
      ("uk/books/regular-stories", SectionContainer(tone = "feature")),
      ("uk/artanddesign/regular-stories", SectionContainer(tone = "feature"))
    )),
    ("uk/money", Map(
      ("uk/money/regular-stories", SportContainer(showMore = false))
    )),
    ("uk/sport", Map(
      ("uk/sport/regular-stories", SportContainer())
    )),
    ("us", Map(
      ("us/news/regular-stories", NewsContainer()),
      ("us/sport/regular-stories", SportContainer()),
      ("us/commentisfree/regular-stories", CommentContainer()),
      ("us/culture/regular-stories", FeaturesContainer()),
      ("us/contributors/feature-stories", CommentContainer())
    )),
    ("us/business", Map(
      ("us/business/regular-stories", SportContainer(showMore = false))
    )),
    ("us/commentisfree", Map(
      ("us/commentisfree/regular-stories", CommentContainer(showMore = false))
    )),
    ("us/culture", Map(
      ("us/culture/regular-stories", FeaturesContainer()),
      ("us/film/regular-stories", SectionContainer(tone = "feature")),
      ("us/music/regular-stories", SectionContainer(tone = "feature")),
      ("us/stage/regular-stories", SectionContainer(tone = "feature")),
      ("us/books/regular-stories", SectionContainer(tone = "feature")),
      ("us/artanddesign/regular-stories", SectionContainer(tone = "feature")),
      ("us/tv-and-radio/regular-stories", SectionContainer(tone = "feature"))
    )),
    ("us/money", Map(
      ("us/money/regular-stories", SportContainer(showMore = false))
    )),
    ("us/sport", Map(
      ("us/sport/regular-stories", SportContainer())
    ))
  )

  def apply(path: String, config: Config): Container = {
    // first check if we have a specific style
    specificStyles.get(path).flatMap { frontStyles =>
      frontStyles.get(config.id)
    }.getOrElse {
      // else use general, defaulting to Highlights
      generalStyles.get(config.id.split("/").last).getOrElse(SectionContainer())
    }
  }

}
