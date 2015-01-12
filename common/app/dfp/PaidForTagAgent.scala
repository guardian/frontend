package dfp

import java.net.URLDecoder

import com.gu.facia.client.models.{CollectionConfigJson => CollectionConfig}
import model.Tag
import model.`package`.frontKeywordIds

trait PaidForTagAgent {

  protected def allPaidForTags: Seq[PaidForTag]
  protected def tagToSponsorsMap: Map[String, Set[String]]
  protected def tagToAdvertisementFeatureSponsorsMap: Map[String, Set[String]]

  private def findWinningDfpTag(capiTagId: String,
                                maybeSectionId: Option[String]): Option[PaidForTag] = {

    def tagMatches(tagId: String, targetedTagName: String): Boolean = {
      tagId.endsWith(s"/$targetedTagName")
    }

    def sectionMatches(sectionId: String, dfpTagAdUnitPaths: Seq[Seq[String]]): Boolean = {
      dfpTagAdUnitPaths.isEmpty || dfpTagAdUnitPaths.exists { path =>
        path.tail.isEmpty || sectionId.startsWith(path.tail.head)
      }
    }

    allPaidForTags find { dfpTag =>
      tagMatches(capiTagId, dfpTag.targetedName) &&
        (maybeSectionId.isEmpty || maybeSectionId.exists { section =>
          val tagAdUnitPaths = dfpTag.lineItems flatMap { lineItem =>
            lineItem.targeting.adUnits map (_.path)
          }
          sectionMatches(section, tagAdUnitPaths)
        })
    }
  }

  private def findWinningTagPair(capiTags: Seq[Tag],
                                 maybeSectionId: Option[String]): Option[CapiTagAndDfpTag] = {
    for (capiTag <- capiTags.filter(_.isSeries)) {
      for (dfpTag <- findWinningDfpTag(capiTag.id, maybeSectionId)) {
        return Some(CapiTagAndDfpTag(capiTag, dfpTag))
      }
    }
    for (capiTag <- capiTags.filter(_.isKeyword)) {
      for (dfpTag <- findWinningDfpTag(capiTag.id, maybeSectionId)) {
        return Some(CapiTagAndDfpTag(capiTag, dfpTag))
      }
    }
    None
  }

  private def isPaidFor(capiTags: Seq[Tag],
                        maybeSectionId: Option[String],
                        paidForType: PaidForType): Boolean = {
    findWinningTagPair(capiTags, maybeSectionId) exists (_.dfpTag.paidForType == paidForType)
  }

  def isSponsored(capiTags: Seq[Tag], maybeSectionId: Option[String]): Boolean = {
    isPaidFor(capiTags, maybeSectionId, Sponsored)
  }

  def isAdvertisementFeature(capiTags: Seq[Tag], maybeSectionId: Option[String]): Boolean = {
    isPaidFor(capiTags, maybeSectionId, AdvertisementFeature)
  }

  def isFoundationSupported(capiTags: Seq[Tag], maybeSectionId: Option[String]): Boolean = {
    isPaidFor(capiTags, maybeSectionId, FoundationFunded)
  }

  private def isPaidFor(capiTagId: String,
                        maybeSectionId: Option[String],
                        paidForType: PaidForType): Boolean = {
    findWinningDfpTag(capiTagId, maybeSectionId) exists (_.paidForType == paidForType)
  }

  def isSponsored(capiTagId: String, maybeSectionId: Option[String]): Boolean = {
    isPaidFor(capiTagId, maybeSectionId, Sponsored)
  }

  def isAdvertisementFeature(capiTagId: String, maybeSectionId: Option[String]): Boolean = {
    isPaidFor(capiTagId, maybeSectionId, AdvertisementFeature)
  }

  def isFoundationSupported(capiTagId: String, maybeSectionId: Option[String]): Boolean = {
    isPaidFor(capiTagId, maybeSectionId, FoundationFunded)
  }

  private def findContainerCapiTagIdAndDfpTag(config: CollectionConfig):
  Option[CapiTagIdAndDfpTag] = {

    def containerCapiTagIds(config: CollectionConfig): Seq[String] = {
      val stopWords = Set("newest", "order-by", "published", "search", "tag", "use-date")

      config.apiQuery map { encodedQuery =>
        val query = URLDecoder.decode(encodedQuery, "utf-8")
        val tokens = query.split( """\?|&|=|\(|\)|\||\,""")
        (tokens filterNot stopWords.contains flatMap frontKeywordIds).toSeq
      } getOrElse Nil
    }

    val candidateCapiTagIds = containerCapiTagIds(config)
    for (capiTagId <- candidateCapiTagIds) {
      for (dfpTag <- findWinningDfpTag(capiTagId, None)) {
        return Some(CapiTagIdAndDfpTag(capiTagId, dfpTag))
      }
    }
    None
  }

  private def isPaidFor(config: CollectionConfig, paidForType: PaidForType): Boolean = {
    findContainerCapiTagIdAndDfpTag(config) exists (_.dfpTag.paidForType == paidForType)
  }

  def sponsorshipType(config: CollectionConfig): Option[String] = {
    findContainerCapiTagIdAndDfpTag(config) map (_.dfpTag.paidForType.name)
  }

  def isSponsored(config: CollectionConfig): Boolean = {
    isPaidFor(config, Sponsored)
  }

  def isAdvertisementFeature(config: CollectionConfig): Boolean = {
    isPaidFor(config, AdvertisementFeature)
  }

  def isFoundationSupported(config: CollectionConfig): Boolean = {
    isPaidFor(config, FoundationFunded)
  }

  def sponsorshipTag(capiTags: Seq[Tag], maybeSectionId: Option[String]): Option[Tag] = {
    findWinningTagPair(capiTags, maybeSectionId) map (_.capiTag)
  }

  def sponsorshipTag(config: CollectionConfig): Option[String] = {
    findContainerCapiTagIdAndDfpTag(config) map (_.capiTagId)
  }

  def isExpiredAdvertisementFeature(capiTags: Seq[Tag],
                                    maybeSectionId: Option[String]): Boolean = {
    val lineItems = findWinningTagPair(capiTags,
      maybeSectionId) map (_.dfpTag.lineItems) getOrElse Nil
    lineItems.nonEmpty && (lineItems forall (_.endTime exists (_.isBeforeNow)))
  }

  private def hasMultiplesOfAPaidForType(capiTags: Seq[Tag],
                                         tagMap: Map[String, Set[String]]): Boolean = {
    capiTags.map { capiTag =>
      tagMap.getOrElse(capiTag.id.split("/").last, Seq[String]())
    }.flatten.toSeq.size > 1
  }

  def hasMultipleSponsors(capiTags: Seq[Tag]): Boolean = {
    hasMultiplesOfAPaidForType(capiTags, tagToSponsorsMap)
  }

  def hasMultipleFeatureAdvertisers(capiTags: Seq[Tag]): Boolean = {
    hasMultiplesOfAPaidForType(capiTags, tagToAdvertisementFeatureSponsorsMap)
  }

  private def hasMultiplesOfAPaidForType(capiTagId: String,
                                         tagMap: Map[String, Set[String]]): Boolean = {
    (tagMap contains capiTagId) && (tagMap(capiTagId).size > 1)
  }

  def hasMultipleSponsors(capiTagId: String): Boolean = {
    hasMultiplesOfAPaidForType(capiTagId, tagToSponsorsMap)
  }

  def hasMultipleFeatureAdvertisers(capiTagId: String): Boolean = {
    hasMultiplesOfAPaidForType(capiTagId, tagToAdvertisementFeatureSponsorsMap)
  }

  def getSponsor(capiTags: Seq[Tag]): Option[String] = {
    findWinningTagPair(capiTags, None) flatMap (_.dfpTag.lineItems.head.sponsor)
  }

  def getSponsor(capiTagId: String): Option[String] = {
    findWinningDfpTag(capiTagId, None) flatMap (_.lineItems.head.sponsor)
  }
}

sealed case class CapiTagAndDfpTag(capiTag: Tag, dfpTag: PaidForTag)

sealed case class CapiTagIdAndDfpTag(capiTagId: String, dfpTag: PaidForTag)
