package views.support

import common.Edition
import common.Edition.defaultEdition
import common.commercial.{Sponsored, _}
import layout.{ColumnAndCards, ContentCard, FaciaContainer}
import model.{Page, PressedPage}
import org.apache.commons.lang.StringEscapeUtils._
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

  def isPaidContent(page: Page): Boolean = isBrandedContent(page, defaultEdition, PaidContent)

  def isSponsoredContent(page: Page)(implicit request: RequestHeader): Boolean =
    isBrandedContent(page, Edition(request), Sponsored)

  def isFoundationFundedContent(page: Page)(implicit request: RequestHeader): Boolean =
    isBrandedContent(page, defaultEdition, Foundation)

  def isBrandedContent(page: Page)(implicit request: RequestHeader): Boolean = {
    isPaidContent(page) || isSponsoredContent(page) || isFoundationFundedContent(page)
  }

  def listSponsorLogosOnPage(page: Page)(implicit request: RequestHeader): Option[Seq[String]] = {

    val edition = Edition(request)
    def sponsor(branding: Edition => Option[Branding]) = branding(edition) map (_.sponsorName.toLowerCase)

    val pageSponsor = sponsor(page.branding)

    val allSponsors = page match {
      case front: PressedPage =>

        val containerSponsors = front.collections.flatMap { container =>
          sponsor(container.branding)
        }

        val cardSponsors = front.collections.flatMap { container =>
          val hasBrandedTag = container.config.showBranding
          lazy val hasNoSponsor = container.branding(edition).isEmpty
          lazy val hasOnlyPaidContent = container.curatedPlusBackfillDeduplicated.forall {
            _.branding(edition).exists(_.sponsorshipType == PaidContent)
          }
          if (hasBrandedTag && hasNoSponsor && hasOnlyPaidContent) {
            container.curatedPlusBackfillDeduplicated.flatMap { card =>
              sponsor(card.branding)
            }
          } else Nil
        }

        val allSponsorsOnPage = pageSponsor.toList ++ containerSponsors ++ cardSponsors
        if (allSponsorsOnPage.isEmpty) None else Some(allSponsorsOnPage.distinct)

      case _ => pageSponsor map (Seq(_))
    }

    allSponsors map (_ map escapeJavaScript)
  }

  object topAboveNavSlot {

    val adSizes: Map[String, Seq[String]] = {
      val fabricAdvertsTop = Seq("88,71")
      val fluidAdvertsTop = Seq("fluid")
      Map(
        "tablet" -> (Seq("1,1", "2,2", "88,70", "728,90") ++ fabricAdvertsTop ++ fluidAdvertsTop),
        "desktop" -> (Seq("1,1", "2,2", "88,70", "728,90", "940,230", "900,250", "970,250") ++ fabricAdvertsTop ++ fluidAdvertsTop)
      )
    }

    // The sizesOverride parameter is for testing only.
    val cssClasses: String = {
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

    def isFirstNonThrasherContainer(containerIndex: Int, containers: Seq[FaciaContainer]): Boolean =
      (containers filterNot (_.isThrasher) map (_.index)).min == containerIndex
  }

  object CssClassBuilder {

    private def cardLink(cardContent: CardContent,
                         adClasses: Option[Seq[String]],
                         sizeClass: Option[String],
                         useCardBranding: Boolean): String = {
      val classes: Seq[String] = Seq(
        "advert",
        sizeClass getOrElse "",
        "advert--capi",
        cardContent.icon map (_ => "advert--media") getOrElse "advert--text",
        adClasses.map(_.map(c => s"advert--$c").mkString(" ")).getOrElse(""),
        if (useCardBranding) "advert--branded" else ""
      )
      classes mkString " "
    }

    def linkFromStandardCard(cardContent: CardContent,
                             adClasses: Option[Seq[String]],
                             useCardBranding: Boolean): String = {
      cardLink(cardContent, adClasses, sizeClass = None, useCardBranding)
    }

    def linkFromSmallCard(cardContent: CardContent,
                          adClasses: Option[Seq[String]],
                          useCardBranding: Boolean): String = {
      cardLink(cardContent, adClasses, sizeClass = Some("advert--small"), useCardBranding)
    }

    def linkFromLargeCard(cardContent: CardContent,
                          adClasses: Option[Seq[String]],
                          useCardBranding: Boolean): String = {
      cardLink(cardContent, adClasses, sizeClass = Some("advert--large"), useCardBranding)
    }

    def advertContainer(otherClasses: Option[Seq[String]]): String =
      "advert-container " + otherClasses.map(_.mkString(" ")).getOrElse("")
  }

  object TrackingCodeBuilder extends implicits.Requests {

    def mkInteractionTrackingCode(frontId: String,
                                  containerIndex: Int,
                                  container: ContainerModel,
                                  card: CardContent)(implicit request: RequestHeader): String = {
      val sponsor =
        container.branding.map(_.sponsorName) orElse card.branding.map(_.sponsorName) getOrElse ""
      val cardIndex =
        (container.content.initialCards ++ container.content.showMoreCards).indexWhere(_.headline == card.headline)
      Seq(
        "Labs front container",
        Edition(request).id,
        frontId,
        s"container-${containerIndex + 1}",
        container.content.title,
        sponsor,
        s"card-${cardIndex + 1}",
        card.headline
      ) mkString " | "
    }

    def mkCapiCardTrackingCode(multiplicity: String,
                               optSection: Option[String],
                               optContainerTitle: Option[String],
                               omnitureId: String,
                               card: CardContent)(implicit request: RequestHeader): String = {
      Seq(
        "merchandising",
        "capi",
        multiplicity,
        optSection.getOrElse(""),
        optContainerTitle.getOrElse(""),
        omnitureId,
        card.branding.map(_.sponsorName).getOrElse(""),
        card.headline
      ) mkString " | "
    }

    def paidCard(articleTitle: String)(implicit request: RequestHeader): String = {
      def param(name: String) = request.getParameter(name) getOrElse "unknown"
      val section = param("s")
      val sponsor = param("brand")
      s"GLabs-native-traffic-card | ${Edition(request).id} | $section | $articleTitle | $sponsor"
    }
  }
}
