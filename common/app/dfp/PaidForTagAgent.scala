package dfp

import java.net.URLDecoder

import com.gu.facia.client.models.{CollectionConfigJson => CollectionConfig}
import common.Edition
import conf.Switches.EditionAwareLogoSlots
import model.Tag
import model.`package`.frontKeywordIds

trait PaidForTagAgent {

  protected def isPreview: Boolean

  protected def currentPaidForTags: Seq[PaidForTag]
  protected def allAdFeatureTags: Seq[PaidForTag]
  protected def tagToSponsorsMap: Map[String, Set[String]]
  protected def tagToAdvertisementFeatureSponsorsMap: Map[String, Set[String]]

  private def findWinningDfpTag(dfpTags: Seq[PaidForTag],
                                capiTagId: String,
                                maybeSectionId: Option[String],
                                maybeEdition: Option[Edition]): Option[PaidForTag] = {

    def tagMatches(tagId: String, dfpTag: PaidForTag): Boolean = {
      tagId.endsWith(s"/${dfpTag.targetedName}")
    }

    def sectionMatches(maybeSectionId: Option[String], dfpTag: PaidForTag): Boolean = {
      maybeSectionId.isEmpty || maybeSectionId.exists { sectionId =>
        val tagAdUnitPaths = dfpTag.lineItems flatMap { lineItem =>
          lineItem.targeting.adUnits map (_.path)
        }
        tagAdUnitPaths.isEmpty || tagAdUnitPaths.exists { path =>
          path.tail.isEmpty || sectionId.startsWith(path.tail.head)
        }
      }
    }

    def editionMatches(maybeEdition: Option[Edition], dfpTag: PaidForTag): Boolean = {
      maybeEdition.isEmpty || maybeEdition.exists { edition =>
        dfpTag.lineItems exists { lineItem =>
          val editionIds = lineItem.targeting.customTargetSets.flatMap {
            _.targets filter {
              _.isEditionTag
            } flatMap (_.values.map(_.toLowerCase))
          }.distinct
          editionIds.isEmpty || editionIds.contains(edition.id.toLowerCase)
        }
      }
    }

    dfpTags find { dfpTag =>
      tagMatches(capiTagId, dfpTag) &&
        sectionMatches(maybeSectionId, dfpTag) &&
        (EditionAwareLogoSlots.isSwitchedOff || editionMatches(maybeEdition, dfpTag))
    }
  }

  private def findWinningTagPair(dfpTags: Seq[PaidForTag],
                                 capiTags: Seq[Tag],
                                 maybeSectionId: Option[String],
                                 maybeEdition: Option[Edition]): Option[CapiTagAndDfpTag] = {
    for (capiTag <- capiTags.filter(_.isSeries)) {
      for (dfpTag <- findWinningDfpTag(dfpTags, capiTag.id, maybeSectionId, maybeEdition)) {
        return Some(CapiTagAndDfpTag(capiTag, dfpTag))
      }
    }
    for (capiTag <- capiTags.filter(_.isKeyword)) {
      for (dfpTag <- findWinningDfpTag(dfpTags, capiTag.id, maybeSectionId, maybeEdition)) {
        return Some(CapiTagAndDfpTag(capiTag, dfpTag))
      }
    }
    None
  }

  private def isPaidFor(capiTags: Seq[Tag],
                        maybeSectionId: Option[String],
                        maybeEdition: Option[Edition],
                        paidForType: PaidForType): Boolean = {
    findWinningTagPair(currentPaidForTags, capiTags, maybeSectionId, maybeEdition) exists {
      _.dfpTag.paidForType == paidForType
    }
  }

  def isSponsored(capiTags: Seq[Tag],
                  maybeSectionId: Option[String],
                  maybeEdition: Option[Edition] = None): Boolean = {
    isPaidFor(capiTags, maybeSectionId, maybeEdition, Sponsored)
  }

  def isAdvertisementFeature(capiTags: Seq[Tag],
                             maybeSectionId: Option[String]): Boolean = {
    isPaidFor(capiTags, maybeSectionId, maybeEdition = None, AdvertisementFeature)
  }

  def isFoundationSupported(capiTags: Seq[Tag],
                            maybeSectionId: Option[String]): Boolean = {
    isPaidFor(capiTags, maybeSectionId, maybeEdition = None, FoundationFunded)
  }

  private def isPaidFor(capiTagId: String,
                        maybeSectionId: Option[String],
                        maybeEdition: Option[Edition],
                        paidForType: PaidForType): Boolean = {
    findWinningDfpTag(currentPaidForTags, capiTagId, maybeSectionId, maybeEdition) exists (_.paidForType == paidForType)
  }

  def isSponsored(capiTagId: String,
                  maybeSectionId: Option[String],
                  maybeEdition: Option[Edition]): Boolean = {
    isPaidFor(capiTagId, maybeSectionId, maybeEdition, Sponsored)
  }

  def isAdvertisementFeature(capiTagId: String,
                             maybeSectionId: Option[String]): Boolean = {
    isPaidFor(capiTagId, maybeSectionId, maybeEdition = None, AdvertisementFeature)
  }

  def isFoundationSupported(capiTagId: String,
                            maybeSectionId: Option[String]): Boolean = {
    isPaidFor(capiTagId, maybeSectionId, maybeEdition = None, FoundationFunded)
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
      for (dfpTag <- findWinningDfpTag(currentPaidForTags, capiTagId, None, None)) {
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
    findWinningTagPair(currentPaidForTags, capiTags, maybeSectionId, None) map (_.capiTag)
  }

  def sponsorshipTag(config: CollectionConfig): Option[String] = {
    findContainerCapiTagIdAndDfpTag(config) map (_.capiTagId)
  }

  def isExpiredAdvertisementFeature(capiTags: Seq[Tag],
                                    maybeSectionId: Option[String]): Boolean = {
    if (isPreview) false
    else {
      val lineItems = findWinningTagPair(allAdFeatureTags, capiTags, maybeSectionId, None) map {
        _.dfpTag.lineItems
      } getOrElse Nil
      lineItems.nonEmpty && (lineItems forall (_.endTime exists (_.isBeforeNow)))
    }
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

  def getSponsor(capiTags: Seq[Tag], edition: Edition): Option[String] = {
    findWinningTagPair(currentPaidForTags, capiTags, None, Some(edition)) flatMap {
      _.dfpTag.lineItems.head.sponsor
    }
  }

  def getSponsor(capiTagId: String, edition: Edition): Option[String] = {
    findWinningDfpTag(currentPaidForTags, capiTagId, None, Some(edition)) flatMap {
      _.lineItems.head.sponsor
    }
  }
}

sealed case class CapiTagAndDfpTag(capiTag: Tag, dfpTag: PaidForTag)

sealed case class CapiTagIdAndDfpTag(capiTagId: String, dfpTag: PaidForTag)
