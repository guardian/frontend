package views.support

import model.Config

object GetContainer {

  /**
   * Mapping of collection 'tone' to Container
   */
  val collectionToneMapping: Map[String, Container] = Map(
    "news"    -> SectionContainer(),
    "feature" -> SectionContainer(tone = "feature"),
    "comment" -> SectionContainer()
  )

  /**
   * Allows use of different containers on specific fronts for specific collections
   */
  val specificContainers: Map[String, Map[String, Container]] = Map(
    ("au", Map(
      ("au/news/regular-stories", NewsContainer()),
      ("au/sport/regular-stories", SportContainer()),
      ("au/tone/features/feature-stories", FeaturesContainer()),
      ("au/commentisfree/regular-stories", CommentContainer()),
      ("au/culture/regular-stories", FeaturesContainer()),
      ("au/contributors/feature-stories", CommentContainer())
    )),
    ("au-alpha", Map(
      ("au-alpha/news/regular-stories", NewsContainer()),
      ("au-alpha/features/feature-stories", FeaturesContainer(headerLink = false)),
      ("au-alpha/special/special-story", SportContainer(headerLink = false)),
      ("au-alpha/contributors/feature-stories", CommentContainer(headerLink = false)),
      ("au-alpha/people-in-the-news/feature-stories", SportContainer(headerLink = false)),
      ("au-alpha/special-other/special-story", SportContainer(headerLink = false))
    )),
    ("au/business", Map(
      ("au/business/regular-stories", SportContainer(showMore = false))
    )),
    ("au/commentisfree", Map(
      ("au/commentisfree/regular-stories", CommentContainer(showMore = false))
    )),
    ("au/culture", Map(
      ("au/culture/regular-stories", FeaturesContainer())
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
      ("uk/tone/features/feature-stories", FeaturesContainer()),
      ("uk/commentisfree/regular-stories", CommentContainer()),
      ("uk/culture/regular-stories", FeaturesContainer()),
      ("uk/contributors/feature-stories", CommentContainer())
    )),
    ("uk-alpha", Map(
      ("uk-alpha/news/regular-stories", NewsContainer()),
      ("uk-alpha/features/feature-stories", FeaturesContainer(headerLink = false)),
      ("uk-alpha/special/special-story", SportContainer(headerLink = false)),
      ("uk-alpha/contributors/feature-stories", CommentContainer(headerLink = false)),
      ("uk-alpha/people-in-the-news/feature-stories", SportContainer(headerLink = false)),
      ("uk-alpha/special-other/special-story", SportContainer(headerLink = false))
    )),
    ("uk/business", Map(
      ("uk/business/regular-stories", SportContainer(showMore = false))
    )),
    ("uk/commentisfree", Map(
      ("uk/commentisfree/regular-stories", CommentContainer(showMore = false))
    )),
    ("uk/culture", Map(
      ("uk/culture/regular-stories", FeaturesContainer())
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
      ("us/tone/features/feature-stories", FeaturesContainer()),
      ("us/commentisfree/regular-stories", CommentContainer()),
      ("us/culture/regular-stories", FeaturesContainer()),
      ("us/contributors/feature-stories", CommentContainer())
    )),
    ("us-alpha", Map(
      ("us-alpha/news/regular-stories", NewsContainer()),
      ("us-alpha/features/feature-stories", FeaturesContainer(headerLink = false)),
      ("us-alpha/special/special-story", SportContainer(headerLink = false)),
      ("us-alpha/contributors/feature-stories", CommentContainer(headerLink = false)),
      ("us-alpha/people-in-the-news/feature-stories", SportContainer(headerLink = false)),
      ("us-alpha/special-other/special-story", SportContainer(headerLink = false))
    )),
    ("us/business", Map(
      ("us/business/regular-stories", SportContainer(showMore = false))
    )),
    ("us/commentisfree", Map(
      ("us/commentisfree/regular-stories", CommentContainer(showMore = false))
    )),
    ("us/culture", Map(
      ("us/culture/regular-stories", FeaturesContainer())
    )),
    ("us/money", Map(
      ("us/money/regular-stories", SportContainer(showMore = false))
    )),
    ("us/sport", Map(
      ("us/sport/regular-stories", SportContainer())
    )),

    ("football", Map(
      ("football/latest-news/regular-stories", SportContainer(showMore = false))
    )),
    ("technology", Map(
      ("technology/latest-news/regular-stories", SportContainer(showMore = false))
    )),
    ("travel", Map(
      ("travel/latest-news/regular-stories", FeaturesContainer(showMore = false))
    )),
    ("film", Map(
      ("film/latest-news/regular-stories", FeaturesContainer(showMore = false))
    )),
    ("world/nsa", Map(
      ("world/nsa/latest-news/regular-stories", SportContainer(showMore = false))
    )),
    ("world/edward-snowden", Map(
      ("world/edward-snowden/latest-news/regular-stories", SportContainer(showMore = false))
    )),
    ("football/arsenal", Map(
      ("football/arsenal/latest-news/regular-stories", SportContainer(showMore = false))
    )),
    ("artanddesign/photography", Map(
      ("artanddesign/photography/latest-news/regular-stories", FeaturesContainer(showMore = false))
    ))
  )

  def apply(path: String, config: Config): Container = {
    // first check if we have a specific style
    specificContainers.get(path).flatMap { frontContainers =>
      frontContainers.get(config.id)
    }.getOrElse {
      // else use general, defaulting to Highlights
      config.collectionTone.flatMap { collectionTone =>
        collectionToneMapping.get(collectionTone)
      }.getOrElse(SectionContainer())
    }
  }

}
