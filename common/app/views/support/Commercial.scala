package views.support

import com.gu.commercial.branding._
import common.Edition
import common.commercial._
import layout.{ColumnAndCards, ContentCard, FaciaContainer, PaidCard}
import model.{Page, PressedPage}
import org.apache.commons.lang.StringEscapeUtils._
import play.api.libs.json.JsBoolean
import play.api.mvc.RequestHeader

object Commercial {

  def shouldShowAds(page: Page): Boolean = page match {
    case c: model.ContentPage if c.item.content.shouldHideAdverts => false
    case p: model.Page if p.metadata.sectionId == "identity" => false
    case s: model.SimplePage if s.metadata.contentType == "Signup" => false
    case e: model.ContentPage if e.item.content.seriesName.contains("Newsletter sign-ups") => false
    case _: model.CommercialExpiryPage => false
    case _ => true
  }

  def articleAsideOptionalSizes(implicit request: RequestHeader): Seq[String] = Edition(request).id match {
    case "US" => Seq("300,1050")
    case _   => Seq.empty
  }

  def glabsLink (request: RequestHeader): String = {
    val glabsUrlSuffix = Edition(request).id match {
      case "AU" => "-australia"
      case "US" => "-us"
      case _ => ""
    }

    s"/guardian-labs$glabsUrlSuffix"
  }

  def isPaidContent(page: Page): Boolean = page.metadata.commercial.exists(_.isPaidContent)

  def isSponsoredContent(page: Page)(implicit request: RequestHeader): Boolean =
    page.metadata.commercial.exists(_.isSponsored(Edition(request)))

  def isFoundationFundedContent(page: Page): Boolean = page.metadata.commercial.exists(_.isFoundationFunded)

  def isBrandedContent(page: Page)(implicit request: RequestHeader): Boolean = {
    isPaidContent(page) || isSponsoredContent(page) || isFoundationFundedContent(page)
  }

  def listSponsorLogosOnPage(page: Page)(implicit request: RequestHeader): Option[Seq[String]] = {

    val edition = Edition(request)
    def sponsor(branding: Branding) = branding.sponsorName.toLowerCase

    val pageSponsor = page.metadata.commercial.flatMap(_.branding(edition)).map(sponsor)

    val allSponsors = page match {
      case front: PressedPage =>

        val containerSponsors = front.collections.flatMap { container =>
          container.branding(edition) flatMap {
            case b: Branding => Some(b.sponsorName.toLowerCase)
            case _ => None
          }
        }

        val cardSponsors = front.collections.flatMap { container =>
          container.branding(edition) match {
            case Some(PaidMultiSponsorBranding) =>
              container.curatedPlusBackfillDeduplicated.flatMap(_.branding(edition).map(sponsor))
            case _ => Nil
          }
        }

        val allSponsorsOnPage = pageSponsor.toList ++ containerSponsors ++ cardSponsors
        if (allSponsorsOnPage.isEmpty) None else Some(allSponsorsOnPage.distinct)

      case _ => pageSponsor map (Seq(_))
    }

    allSponsors map (_ map escapeJavaScript)
  }

  def brandingType(page: Page)(implicit request: RequestHeader): Option[BrandingType] = for {
    commercial <- page.metadata.commercial
    branding <- commercial.branding(Edition(request))
  } yield branding.brandingType

  object topAboveNavSlot {

    val adSizes: Map[String, Seq[String]] = {
      val fabricAdvertsTop = Seq("88,71")
      val fluidAdvertsTop = Seq("fluid")
      Map(
        "tablet" -> (Seq("1,1", "2,2", "728,90") ++ fabricAdvertsTop ++ fluidAdvertsTop),
        "desktop" -> (Seq("1,1", "2,2", "728,90", "940,230", "900,250", "970,250") ++ fabricAdvertsTop ++ fluidAdvertsTop)
      )
    }

    // The sizesOverride parameter is for testing only.
    def cssClasses(metadata: model.MetaData): String = {
      val topBannerDisableSticky = metadata.javascriptConfigOverrides.get("disableStickyTopBanner") match {
        case Some(JsBoolean(true)) => Some("top-banner-ad-container--not-sticky")
        case _                     => None
      }
      val classes = Seq(
        "top-banner-ad-container",
        "js-top-banner"
      ) ++ topBannerDisableSticky

      classes mkString " "
    }

    val slotCssClasses = Seq("top-banner-ad", "top-banner-ad-desktop")
  }

  object container {

    def shouldRenderAsPaidContainer(isPaidFront: Boolean, optContainerModel: Option[ContainerModel]): Boolean = {

      def isPaid(containerModel: ContainerModel): Boolean = containerModel.branding exists {
        case PaidMultiSponsorBranding => true
        case b: Branding => b.isPaid
      }

      !isPaidFront && optContainerModel.exists(isPaid)
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

    private def cardLink(
      cardContent: PaidCard,
      adClasses: Option[Seq[String]],
      sizeClass: Option[String],
      useCardBranding: Boolean
    ): String = {
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

    def linkFromStandardCard(
      cardContent: PaidCard,
      adClasses: Option[Seq[String]],
      useCardBranding: Boolean
    ): String = {
      cardLink(cardContent, adClasses, sizeClass = None, useCardBranding)
    }

    def linkFromSmallCard(
      cardContent: PaidCard,
      adClasses: Option[Seq[String]],
      useCardBranding: Boolean
    ): String = {
      cardLink(cardContent, adClasses, sizeClass = Some("advert--small"), useCardBranding)
    }

    def linkFromLargeCard(
      cardContent: PaidCard,
      adClasses: Option[Seq[String]],
      useCardBranding: Boolean
    ): String = {
      cardLink(cardContent, adClasses, sizeClass = Some("advert--large"), useCardBranding)
    }

    def paidForContainer(otherClasses: Option[Seq[String]]): String =
      "paidfor-container " + otherClasses.map(_.mkString(" ")).getOrElse("")
  }

  object TrackingCodeBuilder extends implicits.Requests {

    def mkInteractionTrackingCode(
      frontId: String,
      containerIndex: Int,
      container: ContainerModel,
      card: PaidCard
    )(implicit request: RequestHeader): String = {
      val sponsor = {
        val containerSponsorName = container.branding collect { case b: Branding => b.sponsorName }
        containerSponsorName orElse card.branding.map(_.sponsorName) getOrElse ""
      }
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

    def mkInteractionTrackingCode(containerIndex: Int, cardIndex: Int, card: ContentCard): String = Seq(
      card.branding.map(_.sponsorName) getOrElse "unknown",
      s"card-${ cardIndex + 1 }",
      card.header.headline
    ).mkString(" | ")

    def mkCapiCardTrackingCode(
      multiplicity: String,
      optSection: Option[String],
      optContainerTitle: Option[String],
      omnitureId: String,
      card: PaidCard
    )(implicit request: RequestHeader): String = {
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
