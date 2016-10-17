package views.support

import common.Edition
import common.Edition.defaultEdition
import common.commercial.{Sponsored, _}
import common.dfp._
import layout.{ColumnAndCards, ContentCard, FaciaContainer}
import model.{ContentType, MetaData, Page, Tags}
import play.api.mvc.RequestHeader


object Commercial {

  def shouldShowAds(page: Page): Boolean = page match {
    case c: model.ContentPage if c.item.content.shouldHideAdverts => false
    case p: model.Page if p.metadata.sectionId == "identity" => false
    case s: model.SimplePage if s.metadata.contentType == "Signup" => false
    case p: model.CommercialExpiryPage => false
    case _ => true
  }

  def glabsLink (request: RequestHeader): String = {
    val glabsUrlSuffix = Edition(request).id match {
      case "AU" => "-australia"
      case "US" => "-us"
      case _ => ""
    }

    s"/guardian-labs$glabsUrlSuffix"
  }

  private def isBrandedContent(page: Page, edition: Edition, sponsorshipType: SponsorshipType): Boolean =
    page.branding(edition).exists(_.sponsorshipType == sponsorshipType)

  def isPaidContent(item: ContentType, page: Page): Boolean =
    isBrandedContent(page, defaultEdition, PaidContent)

  def isSponsoredContent(item: ContentType, page: Page)(implicit request: RequestHeader): Boolean = {
    val edition = Edition(request)
    isBrandedContent(page, edition, Sponsored)
  }

  def isFoundationFundedContent(item: ContentType, page: Page)(implicit request: RequestHeader): Boolean = {
    isBrandedContent(page, defaultEdition, Foundation)
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
}
