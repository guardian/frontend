package common.dfp

import java.net.URLDecoder

import com.gu.facia.api.models.CollectionConfig
import common.Edition
import model.Tag
import model.`package`.frontKeywordIds

trait PaidForTagAgent {

  protected def isPreview: Boolean

  protected def currentPaidForTags: Seq[PaidForTag]
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
          val editions = lineItem.targeting.editions
          editions.isEmpty || editions.contains(edition)
        }
      }
    }

    dfpTags find { dfpTag =>
      tagMatches(capiTagId, dfpTag) &&
        sectionMatches(maybeSectionId, dfpTag) &&
        editionMatches(maybeEdition, dfpTag)
    }
  }

  private def findWinningTagPair(dfpTags: Seq[PaidForTag],
                                 capiTags: Seq[Tag],
                                 maybeSectionId: Option[String],
                                 maybeEdition: Option[Edition]): Option[CapiTagAndDfpTag] = {

    val seriesDfpTags = dfpTags filter (_.tagType == Series)
    val keywordDfpTags = dfpTags filter (_.tagType == Keyword)

    for (capiTag <- capiTags.filter(_.isSeries)) {
      for (dfpTag <- findWinningDfpTag(seriesDfpTags, capiTag.id, maybeSectionId, maybeEdition)) {
        return Some(CapiTagAndDfpTag(capiTag, dfpTag))
      }
    }
    for (capiTag <- capiTags.filter(_.isKeyword)) {
      for (dfpTag <- findWinningDfpTag(keywordDfpTags, capiTag.id, maybeSectionId, maybeEdition)) {
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
        def negativeClause(token: String): Boolean = token.startsWith("-")
        val query = URLDecoder.decode(encodedQuery, "utf-8")
        val tokens = query.split( """\?|&|=|\(|\)|\||\,""")
        (tokens filterNot negativeClause filterNot stopWords.contains flatMap frontKeywordIds).toSeq
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

  def sponsorshipTag(config: CollectionConfig): Option[SponsorshipTag] = {
    findContainerCapiTagIdAndDfpTag(config) map { tagPair =>
      SponsorshipTag(tagPair.dfpTag.tagType, tagPair.capiTagId)
    }
  }

  private def hasMultiplesOfAPaidForType(capiTags: Seq[Tag],
                                         tagMap: Map[String, Set[String]]): Boolean = {
    capiTags.flatMap { capiTag =>
      tagMap.getOrElse(capiTag.id.split("/").last, Seq[String]())
    }.size > 1
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
    findWinningTagPair(currentPaidForTags, capiTags, None, None) flatMap (_.dfpTag.lineItems.head.sponsor)
  }

  def getSponsor(capiTagId: String): Option[String] = {
    findWinningDfpTag(currentPaidForTags, capiTagId, None, None) flatMap (_.lineItems.head.sponsor)
  }
}

sealed case class CapiTagAndDfpTag(capiTag: Tag, dfpTag: PaidForTag)

sealed case class CapiTagIdAndDfpTag(capiTagId: String, dfpTag: PaidForTag)

case class SponsorshipTag(tagType: TagType, tagId: String)
