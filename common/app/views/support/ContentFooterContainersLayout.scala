package views.support

import model.Content
import play.twirl.api.{Html, HtmlFormat}

import scala.collection.immutable.Seq

import common.commercial.{DiscountCodeLinks, DiscountCodeMerchantLink}

object ContentFooterContainersLayout {

  def apply(content: Content, isPaidContent: Boolean)(
      storyPackagePlaceholder: => Html,
  )(onwardPlaceholder: => Html)(commentsPlaceholder: => Html)(mostPopularPlaceholder: => Html)(
      highRelevanceCommercialComponent: => Html,
  )(standardCommercialComponent: => Html)(discountCodeWidget: => Html): Html = {

    def optional(p: => Boolean, htmlBlock: => Html): Option[Html] = if (p) Some(htmlBlock) else None

    val htmlBlocks = if (isPaidContent) {

      // majority of footer components we don't want to appear on advertisement feature articles
      Seq(
        optional(!content.shouldHideAdverts, highRelevanceCommercialComponent),
        Some(storyPackagePlaceholder),
        Some(onwardPlaceholder),
      ).flatten

    } else {

      Seq(
        Some(storyPackagePlaceholder),
        Some(onwardPlaceholder),
        optional(content.trail.isCommentable, commentsPlaceholder),
        Some(mostPopularPlaceholder),
        optional(!content.shouldHideAdverts, standardCommercialComponent),
        optional(
          !content.shouldHideAdverts && DiscountCodeLinks.shouldShowWidget(content.metadata.id),
          discountCodeWidget,
        ),
      ).flatten

    }

    HtmlFormat.fill(htmlBlocks)
  }

}
