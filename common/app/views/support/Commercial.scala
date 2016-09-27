package views.support

import common.Edition
import common.Edition.defaultEdition
import common.commercial.{Sponsored, _}
import common.dfp._
import layout.{ColumnAndCards, ContentCard, FaciaContainer}
import model.pressed.{CollectionConfig, PressedContent}
import model.{ContentType, MetaData, Page, Tag, Tags}
import play.api.mvc.RequestHeader

object Commercial {

  def shouldShowAds(page: Page): Boolean = page match {
    case c: model.ContentPage if c.item.content.shouldHideAdverts => false
    case p: model.Page if p.metadata.sectionId == "identity" => false
    case p: model.CommercialExpiryPage => false
    case _ => true
  }

  private def isBrandedContent(
    dfpDependentCondition: => Boolean,
    page: Page,
    edition: Edition,
    sponsorshipType: SponsorshipType
  ): Boolean =
    page.branding(edition).exists(_.sponsorshipType == sponsorshipType)

  def isPaidContent(item: ContentType, page: Page): Boolean =
    isBrandedContent(item.commercial.isAdvertisementFeature, page, defaultEdition, PaidContent)

  def isSponsoredContent(item: ContentType, page: Page)(implicit request: RequestHeader): Boolean = {
    val edition = Edition(request)
    isBrandedContent(item.commercial.isSponsored(Some(edition)), page, edition, Sponsored)
  }

  def isFoundationFundedContent(item: ContentType, page: Page)(implicit request: RequestHeader): Boolean = {
    isBrandedContent(item.commercial.isFoundationSupported, page, defaultEdition, Foundation)
  }

  def isBrandedContent(item: ContentType, page: Page)(implicit request: RequestHeader): Boolean = {
    isPaidContent(item, page) || isSponsoredContent(item, page) || isFoundationFundedContent(item, page)
  }

  private def hasAdOfSize(slot: AdSlot,
                          size: AdSize,
                          metaData: MetaData,
                          edition: Edition,
                          sizesOverride: Seq[AdSize] = Nil): Boolean = {
    val sizes = if (sizesOverride.nonEmpty) sizesOverride else metaData.sizeOfTakeoverAdsInSlot(slot, edition)
    sizes contains size
  }

  object topAboveNavSlot {

    def adSizes(metaData: MetaData, edition: Edition, maybeTags: Option[Tags]): Map[String, Seq[String]] = {
      val fabricAdvertsTop = Seq("88,71")
      val fluidAdvertsTop = Seq("fluid")
      Map(
        "tablet" -> (Seq("1,1", "88,70", "728,90") ++ fabricAdvertsTop ++ fluidAdvertsTop),
        "desktop" -> (Seq("1,1", "88,70", "728,90", "940,230", "900,250", "970,250") ++ fabricAdvertsTop ++ fluidAdvertsTop)
      )
    }

    // The sizesOverride parameter is for testing only.
    def cssClasses(metaData: MetaData, edition: Edition, maybeTags: Option[Tags], sizesOverride: Seq[AdSize] = Nil): String = {
      val classes = Seq(
        "top-banner-ad-container",
        "js-top-banner"
      )

      classes mkString " "
    }

    val slotCssClasses = Seq("top-banner-ad", "top-banner-ad-desktop")
  }

  object container {

    def shouldRenderAsPaidContainer(isPaidFront: Boolean,
                                    container: FaciaContainer,
                                    optContainerModel: Option[ContainerModel]): Boolean = {

      def isPaid(containerModel: ContainerModel): Boolean = {

        val isPaidContainer = containerModel.branding.exists(_.sponsorshipType == PaidContent)

        val isAllPaidContent = {
          val content = containerModel.content
          val cards = content.initialCards ++ content.showMoreCards
          cards.nonEmpty && cards.forall(_.branding.exists(_.sponsorshipType == PaidContent))
        }

        isPaidContainer || isAllPaidContent
      }

      !isPaidFront && container.showBranding && optContainerModel.exists(isPaid)
    }

    def mkSponsorDataAttributes(config: CollectionConfig): Option[SponsorDataAttributes] = {
      DfpAgent.findContainerCapiTagIdAndDfpTag(config) map { tagData =>
        val capiTagId = tagData.capiTagId
        val dfpTag = tagData.dfpTag
        def tagId(tagType: TagType) = if (dfpTag.tagType == tagType) Some(capiTagId) else None
        SponsorDataAttributes(
          sponsor = dfpTag.lineItems.headOption flatMap (_.sponsor),
          sponsorshipType = dfpTag.paidForType.name,
          seriesId = tagId(Series),
          keywordId = tagId(Keyword)
        )
      }
    }

    def numberOfItems(container: FaciaContainer): Int = container.containerLayout.map {
      _.slices.flatMap {
        _.columns.flatMap { case ColumnAndCards(_, cards) =>
          cards.flatMap {
            _.item match {
                case card: ContentCard => Some(card)
                case _ => None
            }
          }
        }
      }.length
    }.getOrElse(0)
  }

  object containerCard {

    def mkCardsWithSponsorDataAttributes(
      container: FaciaContainer,
      maxCardCount: Int
    ): Seq[CardWithSponsorDataAttributes] = {

      val contentCards = container.containerLayout map {
        _.slices flatMap {
          _.columns flatMap { case ColumnAndCards(_, cards) =>
            cards map {
              _.item match {
                case card: ContentCard => Some(card)
                case _ => None
              }
            }
          }
        }
      } getOrElse Nil

      val cardsAndContents: Seq[ContentCardAndItsContent] = {
        val allCardsAndContents = contentCards zip container.collectionEssentials.items flatMap {
          case (None, _) => None
          case (Some(card), content) => Some(ContentCardAndItsContent(card, content))
        }
        allCardsAndContents take maxCardCount
      }

      cardsAndContents map (CardWithSponsorDataAttributes(_))
    }
  }
}

case class ContentCardAndItsContent(card: ContentCard, content: PressedContent)

case class SponsorDataAttributes(
  sponsor: Option[String],
  sponsorshipType: String,
  seriesId: Option[String],
  keywordId: Option[String]
)

case class CardWithSponsorDataAttributes(card: ContentCard, sponsorData: Option[SponsorDataAttributes])

object CardWithSponsorDataAttributes {

  def sponsorDataAttributes(item: PressedContent): Option[SponsorDataAttributes] = {

    def sponsoredTagPair(content: ContentType): Option[CapiTagAndDfpTag] = {
      DfpAgent.winningTagPair(
        capiTags = content.tags.tags,
        sectionId = Some(content.metadata.sectionId),
        edition = None
      )
    }

    def mkFromSponsoredTagPair(tagProps: CapiTagAndDfpTag): SponsorDataAttributes = {
      val capiTag = tagProps.capiTag
      val dfpTag = tagProps.dfpTag

      def tagId(p: Tag => Boolean): Option[String] = if (p(capiTag)) Some(capiTag.id) else None

      SponsorDataAttributes(
        sponsor = dfpTag.lineItems.headOption flatMap (_.sponsor),
        sponsorshipType = dfpTag.paidForType.name,
        seriesId = tagId(_.isSeries),
        keywordId = tagId(_.isKeyword)
      )
    }

    item.properties.maybeContent flatMap (sponsoredTagPair(_) map mkFromSponsoredTagPair)
  }

  def apply(cardAndContent: ContentCardAndItsContent): CardWithSponsorDataAttributes = {
    CardWithSponsorDataAttributes(cardAndContent.card, sponsorDataAttributes(cardAndContent.content))
  }
}
