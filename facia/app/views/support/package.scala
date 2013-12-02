package views.support

import model.Config

object GetContainer {

  /**
   * Mapping of collection 'type' to Container - in general, this should suffice
   */
  val collectionTypeMapping: Map[String, Container] = Map(
    "news"            -> NewsContainer(),
    "sport"           -> SportContainer(),
    "feature"         -> FeaturesContainer(),
    "comment"         -> CommentContainer(),
    "section"         -> SectionContainer(),
    "section-feature" -> SectionContainer(tone = "feature")
  )

  /**
   * Allows use of different containers on specific fronts for specific collection
   */
  val specificContainers: Map[String, Map[String, Container]] = Map(
    ("au/business", Map(
      ("au/business/regular-stories", SportContainer(showMore = false))
    )),
    ("au/commentisfree", Map(
      ("au/commentisfree/regular-stories", CommentContainer(showMore = false))
    )),
    ("au/money", Map(
      ("au/money/regular-stories", SportContainer(showMore = false))
    )),
    ("uk/business", Map(
      ("uk/business/regular-stories", SportContainer(showMore = false))
    )),
    ("uk/commentisfree", Map(
      ("uk/commentisfree/regular-stories", CommentContainer(showMore = false))
    )),
    ("uk/money", Map(
      ("uk/money/regular-stories", SportContainer(showMore = false))
    )),
    ("us/business", Map(
      ("us/business/regular-stories", SportContainer(showMore = false))
    )),
    ("us/commentisfree", Map(
      ("us/commentisfree/regular-stories", CommentContainer(showMore = false))
    )),
    ("us/money", Map(
      ("us/money/regular-stories", SportContainer(showMore = false))
    )),

    ("football", Map(
      ("football/latest-news/regular-stories", SportContainer(showMore = false))
    )),
    ("technology", Map(
      ("technology/latest-news/regular-stories", NewsContainer(showMore = false))
    )),
    ("travel", Map(
      ("travel/latest-news/regular-stories", FeaturesContainer(showMore = false))
    )),
    ("film", Map(
      ("film/latest-news/regular-stories", FeaturesContainer(showMore = false))
    )),
    ("world/nsa", Map(
      ("world/nsa/latest-news/regular-stories", NewsContainer(showMore = false))
    )),
    ("world/edward-snowden", Map(
      ("world/edward-snowden/latest-news/regular-stories", NewsContainer(showMore = false))
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
      config.collectionType.flatMap { collectionType =>
        collectionTypeMapping.get(collectionType)
      }.getOrElse(SectionContainer())
    }
  }

}
