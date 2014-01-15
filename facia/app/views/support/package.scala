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
      ("au/contributors/feature-stories", CommentContainer()),
      ("au/most-viewed/regular-stories", PopularContainer())
    )),
    ("au-alpha", Map(
      ("au-alpha/news/regular-stories", NewsContainer()),
      ("au-alpha/features/feature-stories", FeaturesContainer()),
      ("au-alpha/special/special-story", SportContainer()),
      ("au-alpha/contributors/feature-stories", CommentContainer()),
      ("au-alpha/people-in-the-news/feature-stories", SportContainer()),
      ("au-alpha/special-other/special-story", SportContainer()),
      ("au/most-viewed/regular-stories", PopularContainer())
    )),
    ("au/business", Map(
      ("au/business/regular-stories", SportContainer(showMore = false)),
      ("au/business/most-viewed/regular-stories", PopularContainer())
    )),
    ("au/commentisfree", Map(
      ("au/commentisfree/regular-stories", CommentContainer(showMore = false)),
      ("au/commentisfree/most-viewed/regular-stories", PopularContainer())
    )),
    ("au/culture", Map(
      ("au/culture/regular-stories", FeaturesContainer()),
      ("au/culture/most-viewed/regular-stories", PopularContainer())
    )),
    ("au/money", Map(
      ("au/money/regular-stories", SportContainer(showMore = false)),
      ("au/money/most-viewed/regular-stories", PopularContainer())
    )),
    ("au/sport", Map(
      ("au/sport/regular-stories", SportContainer()),
      ("au/sport/most-viewed/regular-stories", PopularContainer())
    )),
    ("uk", Map(
      ("uk/news/regular-stories", NewsContainer()),
      ("uk/sport/regular-stories", SportContainer()),
      ("uk/tone/features/feature-stories", FeaturesContainer()),
      ("uk/commentisfree/regular-stories", CommentContainer()),
      ("uk/culture/regular-stories", FeaturesContainer()),
      ("uk/contributors/feature-stories", CommentContainer()),
      ("uk/most-viewed/regular-stories", PopularContainer())
    )),
    ("uk-alpha", Map(
      ("uk-alpha/news/regular-stories", TopStoriesContainer()),
      ("uk-alpha/features/feature-stories", FeaturesContainer()),
      ("uk-alpha/special/special-story", SportContainer()),
      ("uk-alpha/contributors/feature-stories", CommentContainer()),
      ("uk-alpha/people-in-the-news/feature-stories", SportContainer()),
      ("uk-alpha/special-other/special-story", SportContainer()),
      ("uk/most-viewed/regular-stories", PopularContainer())
    )),
    ("uk/business", Map(
      ("uk/business/regular-stories", SportContainer(showMore = false)),
      ("uk/business/most-viewed/regular-stories", PopularContainer())
    )),
    ("uk/commentisfree", Map(
      ("uk/commentisfree/regular-stories", CommentContainer(showMore = false)),
      ("uk/commentisfree/most-viewed/regular-stories", PopularContainer())
    )),
    ("uk/culture", Map(
      ("uk/culture/regular-stories", FeaturesContainer()),
      ("uk/culture/most-viewed/regular-stories", PopularContainer())
    )),
    ("uk/money", Map(
      ("uk/money/regular-stories", SportContainer(showMore = false)),
      ("uk/money/most-viewed/regular-stories", PopularContainer())
    )),
    ("uk/sport", Map(
      ("uk/sport/regular-stories", SportContainer()),
      ("uk/sport/most-viewed/regular-stories", PopularContainer())
    )),
    ("us", Map(
      ("us/news/regular-stories", NewsContainer()),
      ("us/sport/regular-stories", SportContainer()),
      ("us/tone/features/feature-stories", FeaturesContainer()),
      ("us/commentisfree/regular-stories", CommentContainer()),
      ("us/culture/regular-stories", FeaturesContainer()),
      ("us/contributors/feature-stories", CommentContainer()),
      ("us/most-viewed/regular-stories", PopularContainer())
    )),
    ("us-alpha", Map(
      ("us-alpha/news/regular-stories", NewsContainer()),
      ("us-alpha/features/feature-stories", FeaturesContainer()),
      ("us-alpha/special/special-story", SportContainer()),
      ("us-alpha/contributors/feature-stories", CommentContainer()),
      ("us-alpha/people-in-the-news/feature-stories", SportContainer()),
      ("us-alpha/special-other/special-story", SportContainer()),
      ("us/most-viewed/regular-stories", PopularContainer())
    )),
    ("us/business", Map(
      ("us/business/regular-stories", SportContainer(showMore = false)),
      ("us/business/most-viewed/regular-stories", PopularContainer())
    )),
    ("us/commentisfree", Map(
      ("us/commentisfree/regular-stories", CommentContainer(showMore = false)),
      ("us/commentisfree/most-viewed/regular-stories", PopularContainer())
    )),
    ("us/culture", Map(
      ("us/culture/regular-stories", FeaturesContainer()),
      ("us/culture/most-viewed/regular-stories", PopularContainer())
    )),
    ("us/money", Map(
      ("us/money/regular-stories", SportContainer(showMore = false)),
      ("us/money/most-viewed/regular-stories", PopularContainer())
    )),
    ("us/sport", Map(
      ("us/sport/regular-stories", SportContainer()),
      ("us/sport/most-viewed/regular-stories", PopularContainer())
    )),

    ("football", Map(
      ("football/latest-news/regular-stories", SportContainer(showMore = false)),
      ("football/most-viewed/regular-stories", PopularContainer())
    )),
    ("technology", Map(
      ("technology/latest-news/regular-stories", SportContainer(showMore = false)),
      ("technology/most-viewed/regular-stories", PopularContainer())
    )),
    ("travel", Map(
      ("travel/latest-news/regular-stories", FeaturesContainer(showMore = false)),
      ("travel/most-viewed/regular-stories", PopularContainer())
    )),
    ("film", Map(
      ("film/latest-news/regular-stories", FeaturesContainer(showMore = false)),
      ("film/most-viewed/regular-stories", PopularContainer())
    )),
    ("world/nsa", Map(
      ("world/nsa/latest-news/regular-stories", SportContainer(showMore = false)),
      ("world/nsa/most-viewed/regular-stories", PopularContainer())
    )),
    ("world/edward-snowden", Map(
      ("world/edward-snowden/latest-news/regular-stories", SportContainer(showMore = false)),
      ("world/edward-snowden/most-viewed/regular-stories", PopularContainer())
    )),
    ("football/arsenal", Map(
      ("football/arsenal/latest-news/regular-stories", SportContainer(showMore = false)),
      ("football/arsenal/most-viewed/regular-stories", PopularContainer())
    )),
    ("artanddesign/photography", Map(
      ("artanddesign/photography/latest-news/regular-stories", FeaturesContainer(showMore = false)),
      ("artanddesign/photography/most-viewed/regular-stories", PopularContainer())
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
