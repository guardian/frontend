package views.support

import common.Edition
import common.commercial.{CardContent, ContainerModel}
import common.dfp.AdSize.responsiveSize
import common.dfp._
import conf.switches.Switches._
import layout.{ColumnAndCards, ContentCard, FaciaContainer}
import model.pressed.{CollectionConfig, PressedContent}
import model.{Branding, ContentType, MetaData, Page, PaidContent, Tag}

object Commercial {

  def shouldShowAds(page: Page): Boolean = page match {
    case c: model.ContentPage if c.item.content.shouldHideAdverts => false
    case p: model.Page if p.metadata.section == "identity" => false
    case p: model.CommercialExpiryPage => false
    case _ => true
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

    private def isBusinessFront(metaData: MetaData) = {
      metaData.id == "uk/business" || metaData.id == "us/business" || metaData.id == "au/business"
    }

    def adSizes(metaData: MetaData, edition: Edition): Map[String, Seq[String]] = {
      val fabricAdvertsTop = if (FabricAdverts.isSwitchedOn) Some("88,71") else None
      Map(
        "mobile" -> (Seq("1,1", "88,70", "728,90") ++ fabricAdvertsTop),
        "desktop" -> (Seq("1,1", "88,70", "728,90", "940,230", "900,250", "970,250") ++ fabricAdvertsTop)
      )
    }

    // The sizesOverride parameter is for testing only.
    def cssClasses(metaData: MetaData, edition: Edition, sizesOverride: Seq[AdSize] = Nil): String = {
      val classes = Seq(
        "top-banner-ad-container",
        "top-banner-ad-container--desktop",
        "top-banner-ad-container--above-nav",
        "js-top-banner-above-nav")

      val sizeSpecificClass = {
        // Keeping this code for now since we'll be running another similar
        // experiment in the near future:
        // if (FixedTopAboveNavAdSlotSwitch.isSwitchedOn && isBusinessFront(metaData)) {
        //   if (hasAdOfSize(TopAboveNavSlot, leaderboardSize, metaData, edition, sizesOverride)) {
        //     "top-banner-ad-container--small"
        //   } else if (hasAdOfSize(TopAboveNavSlot, responsiveSize, metaData, edition, sizesOverride)) {
        //     "top-banner-ad-container--responsive"
        //   } else {
        //     "top-banner-ad-container--large"
        //   }
        // } else {
          "top-banner-ad-container--reveal"
        // }
      }

      (classes :+ sizeSpecificClass) mkString " "
    }
  }

  object topBelowNavSlot {

    def hasAd(metaData: MetaData, edition: Edition): Boolean = {
      metaData.hasAdInBelowTopNavSlot(edition)
    }
  }

  object topSlot {

    def hasResponsiveAd(metaData: MetaData, edition: Edition): Boolean = {
      hasAdOfSize(TopSlot, responsiveSize, metaData, edition)
    }
  }

  object container {

    def shouldRenderAsPaidContainer(isPaidFront: Boolean,
                                    container: FaciaContainer,
                                    optContainerModel: Option[ContainerModel]): Boolean = {

      def isPaid(containerModel: ContainerModel): Boolean = {

        def isPaidBrandingAttributes(brandingAttributes: Option[SponsorDataAttributes]): Boolean =
          brandingAttributes.exists(_.sponsorshipType == "advertisement-features")

        def isPaidBranding(branding: Option[Branding]): Boolean =
          branding.exists(_.sponsorshipType == PaidContent)

        def isPaid(card: CardContent): Boolean = if (staticBadgesSwitch.isSwitchedOn) {
          isPaidBranding(card.branding)
        } else false

        val isPaidContainer = if (staticBadgesSwitch.isSwitchedOn) {
          isPaidBranding(containerModel.branding)
        } else {
          isPaidBrandingAttributes(containerModel.brandingAttributes)
        }

        val isAllPaidContent = {
          val content = containerModel.content
          val cards = content.initialCards ++ content.showMoreCards
          cards.nonEmpty && cards.forall(isPaid)
        }

        isPaidContainer || isAllPaidContent
      }

      !isPaidFront &&
        (container.commercialOptions.isPaidContainer || optContainerModel.exists(isPaid))
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
        sectionId = Some(content.metadata.section),
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
