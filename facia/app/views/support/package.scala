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
      ("au/tone/features/feature-stories", FeaturesContainer(adSlot = Some(AdSlot.First))),
      ("au/commentisfree/regular-stories", CommentContainer()),
      ("au/culture/regular-stories", FeaturesContainer(adSlot = Some(AdSlot.Second))),
      ("au/contributors/feature-stories", CommentContainer()),
      ("au/most-viewed/regular-stories", PopularContainer())
    )),
    ("au-alpha", Map(
      ("au-alpha/news/regular-stories", NewsContainer()),
      ("au-alpha/special-1/special-story", SpecialContainer()),
      ("au-alpha/features/feature-stories", FeaturesContainer(adSlot = Some(AdSlot.First))),
      ("au-alpha/special/special-story", SpecialContainer()),
      ("au-alpha/contributors/feature-stories", CommentAndDebateContainer()),
      ("au-alpha/special-2/special-story", SpecialContainer()),
      ("au-alpha/people-in-the-news/feature-stories", PeopleContainer(adSlot = Some(AdSlot.Second))),
      ("au-alpha/special-other/special-story", SpecialContainer()),
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
      ("uk/tone/features/feature-stories", FeaturesContainer(adSlot = Some(AdSlot.First))),
      ("uk-alpha/features/feature-stories", FeaturesContainer(adSlot = Some(AdSlot.First))),
      ("uk/commentisfree/regular-stories", CommentContainer()),
      ("uk/culture/regular-stories", FeaturesContainer(adSlot = Some(AdSlot.Second))),
      ("uk/contributors/feature-stories", CommentContainer()),
      ("uk/most-viewed/regular-stories", PopularContainer())
    )),
    ("uk-alpha", Map(
      ("uk-alpha/news/regular-stories", NewsContainer()),
      ("uk-alpha/special-1/special-story", SpecialContainer()),
      ("uk-alpha/features/feature-stories", FeaturesContainer(adSlot = Some(AdSlot.First))),
      ("uk-alpha/special/special-story", SpecialContainer()),
      ("uk-alpha/contributors/feature-stories", CommentAndDebateContainer()),
      ("uk-alpha/special-2/special-story", SpecialContainer()),
      ("uk-alpha/people-in-the-news/feature-stories", PeopleContainer(adSlot = Some(AdSlot.Second))),
      ("uk-alpha/special-other/special-story", SpecialContainer()),
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
      ("us/tone/features/feature-stories", FeaturesContainer(adSlot = Some(AdSlot.First))),
      ("us/commentisfree/regular-stories", CommentContainer()),
      ("us/culture/regular-stories", FeaturesContainer(adSlot = Some(AdSlot.Second))),
      ("us/contributors/feature-stories", CommentContainer()),
      ("us/most-viewed/regular-stories", PopularContainer())
    )),
    ("us-alpha", Map(
      ("us-alpha/news/regular-stories", NewsContainer()),
      ("us-alpha/special-1/special-story", SpecialContainer()),
      ("us-alpha/features/feature-stories", FeaturesContainer(adSlot = Some(AdSlot.First))),
      ("us-alpha/special/special-story", SpecialContainer()),
      ("us-alpha/contributors/feature-stories", CommentAndDebateContainer()),
      ("uk-alpha/special-2/special-story", SpecialContainer()),
      ("us-alpha/people-in-the-news/feature-stories", PeopleContainer(adSlot = Some(AdSlot.Second))),
      ("us-alpha/special-other/special-story", SpecialContainer()),
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
