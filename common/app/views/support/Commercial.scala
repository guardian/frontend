package views.support

import com.gu.commercial.branding._
import common.Edition
import common.commercial._
import layout.{ColumnAndCards, ContentCard, FaciaContainer, PaidCard}
import model.DotcomContentType.Signup
import model.{ContentType, Page, PressedPage}
import org.apache.commons.lang.StringEscapeUtils._
import play.api.libs.json.JsBoolean
import play.api.mvc.RequestHeader
import play.twirl.api.Html

object Commercial {
  // some users get an ad-free experience
  def isAdFree(request: RequestHeader): Boolean = {
    try {
      request.headers.get("X-GU-Commercial-Ad-Free").exists(_.toLowerCase == "true") ||
      request.cookies.get("GU_AF1").exists(_.value.toLong > 0)
    } catch {
      case e: Exception => false // in case the cookie value can't be converted toInt
    }
  }

  def isOnDarkBackground(content: ContentType, isPaidContent: Boolean): Boolean = {
    content.tags.isGallery ||
    (!isPaidContent && (content.tags.isAudio || content.tags.isVideo))
  }

  // sometimes we don't _want_ to show ads (e.g. on sensitive content)
  def shouldShowAds(page: Page)(implicit request: RequestHeader): Boolean = {
    if (request.queryString.get("forceads").isDefined) {
      true
    } else {
      page match {
        case c: model.ContentPage if c.item.content.shouldHideAdverts                          => false
        case p: model.Page if p.metadata.sectionId == "identity"                               => false
        case s: model.SimplePage if s.metadata.contentType.contains(Signup)                    => false
        case e: model.ContentPage if e.item.content.seriesName.contains("Newsletter sign-ups") => false
        case _: model.CommercialExpiryPage                                                     => false
        case _                                                                                 => true
      }
    }
  }

  def articleAsideOptionalSizes(isShowcase: Boolean)(implicit request: RequestHeader): Seq[String] = {
    (isShowcase, Edition(request).id) match {
      case (true, _)     => Seq.empty
      case (false, "US") => Seq("300,600", "fluid", "300,1050")
      case (false, _)    => Seq("300,600", "fluid")
    }
  }

  def glabsLink(request: RequestHeader): String = {
    val glabsUrlSuffix = Edition(request).id match {
      case "AU" => "-australia"
      case "US" => "-us"
      case _    => ""
    }

    s"/guardian-labs$glabsUrlSuffix"
  }

  def isPaidContent(page: Page): Boolean = page.metadata.commercial.exists(_.isPaidContent)

  def isSponsoredContent(page: Page)(implicit request: RequestHeader): Boolean =
    page.metadata.commercial.exists(_.isSponsored(Edition(request)))

  def isFoundationFundedContent(page: Page): Boolean = page.metadata.commercial.exists(_.isFoundationFunded)

  object topAboveNavSlot {
    // The sizesOverride parameter is for testing only.
    def cssClasses(metadata: model.MetaData): String = {
      val topBannerDisableSticky = metadata.javascriptConfigOverrides.get("disableStickyTopBanner") match {
        case Some(JsBoolean(true)) => Some("top-banner-ad-container--not-sticky")
        case _                     => None
      }
      val classes = Seq(
        "top-banner-ad-container",
        "js-top-banner",
      ) ++ topBannerDisableSticky

      classes mkString " "
    }

    val slotCssClasses = Seq("top-banner-ad", "top-banner-ad-desktop")
  }

  object container {

    def shouldRenderAsPaidContainer(isPaidFront: Boolean, optContainerModel: Option[ContainerModel]): Boolean = {

      def isPaid(containerModel: ContainerModel): Boolean =
        containerModel.branding exists {
          case PaidMultiSponsorBranding => true
          case b: Branding              => b.isPaid
        }

      !isPaidFront && optContainerModel.exists(isPaid)
    }

    def numberOfItems(container: FaciaContainer): Int =
      container.containerLayout
        .map {
          _.slices
            .flatMap {
              _.columns.flatMap { case ColumnAndCards(_, cards) =>
                cards.flatMap {
                  _.item match {
                    case card: ContentCard => Some(card)
                    case _                 => None
                  }
                }
              }
            }
            .length
        }
        .getOrElse(0)

    def isFirstNonThrasherContainer(containerIndex: Int, containers: Seq[FaciaContainer]): Boolean =
      (containers filterNot (_.isThrasher) map (_.index)).min == containerIndex
  }

  object CssClassBuilder {

    private def cardLink(
        cardContent: PaidCard,
        adClasses: Option[Seq[String]],
        sizeClass: Option[String],
        useCardBranding: Boolean,
    ): String = {
      val classes: Seq[String] = Seq(
        "vergadain",
        sizeClass getOrElse "",
        "vergadain--capi",
        cardContent.icon map (_ => "vergadain--media") getOrElse "vergadain--text",
        adClasses.map(_.map(c => s"vergadain--$c").mkString(" ")).getOrElse(""),
        if (useCardBranding) "vergadain--branded" else "",
      )
      classes mkString " "
    }

    def linkFromStandardCard(
        cardContent: PaidCard,
        adClasses: Option[Seq[String]],
        useCardBranding: Boolean,
    ): String = {
      cardLink(cardContent, adClasses, sizeClass = None, useCardBranding)
    }

    def linkFromSmallCard(
        cardContent: PaidCard,
        adClasses: Option[Seq[String]],
        useCardBranding: Boolean,
    ): String = {
      cardLink(cardContent, adClasses, sizeClass = Some("vergadain--small"), useCardBranding)
    }

    def linkFromLargeCard(
        cardContent: PaidCard,
        adClasses: Option[Seq[String]],
        useCardBranding: Boolean,
    ): String = {
      cardLink(cardContent, adClasses, sizeClass = Some("vergadain--large"), useCardBranding)
    }

    def paidForContainer(otherClasses: Option[Seq[String]]): String =
      "paidfor-container " + otherClasses.map(_.mkString(" ")).getOrElse("")
  }

  object TrackingCodeBuilder extends implicits.Requests {

    private def mkString(
        containerType: String,
        editionId: String,
        frontId: String,
        containerIndex: Int,
        containerTitle: String,
        sponsorName: String,
        cardIndex: Int,
        cardTitle: String,
    ) =
      Seq(
        containerType,
        editionId,
        frontId,
        s"container-${containerIndex + 1}",
        containerTitle,
        sponsorName,
        s"card-${cardIndex + 1}",
        cardTitle,
      ) mkString " | "

    def mkInteractionTrackingCode(
        frontId: String,
        containerIndex: Int,
        container: ContainerModel,
    )(implicit request: RequestHeader): String =
      mkString(
        containerType = "Labs front container",
        editionId = Edition(request).id,
        frontId = frontId,
        containerIndex = containerIndex,
        containerTitle = container.content.title,
        sponsorName = {
          val containerSponsorName = container.branding collect { case b: Branding => b.sponsorName }
          containerSponsorName getOrElse ""
        },
        cardIndex = -1,
        cardTitle = container.content.title,
      )

    def mkInteractionTrackingCode(
        frontId: String,
        containerIndex: Int,
        container: ContainerModel,
        card: PaidCard,
    )(implicit request: RequestHeader): String =
      mkString(
        containerType = "Labs front container",
        editionId = Edition(request).id,
        frontId = frontId,
        containerIndex = containerIndex,
        containerTitle = container.content.title,
        sponsorName = {
          val containerSponsorName = container.branding collect { case b: Branding => b.sponsorName }
          containerSponsorName orElse card.branding.map(_.sponsorName) getOrElse ""
        },
        cardIndex = (container.content.initialCards ++ container.content.showMoreCards)
          .indexWhere(_.headline == card.headline),
        cardTitle = card.headline,
      )

    def mkInteractionTrackingCode(
        containerIndex: Int,
        cardIndex: Int,
        card: ContentCard,
        containerDisplayName: Option[String],
        frontId: Option[String],
    )(implicit request: RequestHeader): String = {

      val isContentPage =
        containerDisplayName.contains("More on this story") ||
          containerDisplayName.contains("Related content")

      mkString(
        containerType =
          if (isContentPage) "Onward container"
          else "Front container",
        editionId = Edition(request).id,
        frontId = frontId.filter(_.nonEmpty).getOrElse("unknown front id"),
        containerIndex = containerIndex,
        containerTitle = containerDisplayName.getOrElse("unknown container"),
        sponsorName = card.branding.map(_.sponsorName) getOrElse "unknown",
        cardIndex = cardIndex,
        cardTitle = card.header.headline,
      )
    }

    def mkCapiCardTrackingCode(
        multiplicity: String,
        optSection: Option[String],
        optContainerTitle: Option[String],
        omnitureId: String,
        card: PaidCard,
    )(implicit request: RequestHeader): String = {
      Seq(
        "merchandising",
        "capi",
        multiplicity,
        optSection.getOrElse(""),
        optContainerTitle.getOrElse(""),
        omnitureId,
        card.branding.map(_.sponsorName).getOrElse(""),
        card.headline,
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
