package views.support

import conf.Switches.OutbrainSwitch
import model.{Content, RelatedContent}
import play.twirl.api.{Html, HtmlFormat}

import scala.collection.immutable.Seq

object ContentFooterContainersLayout {

  def apply(content: Content, related: RelatedContent, isAdvertisementFeature: Boolean)
           (storyPackagePlaceholder: => Html)
           (onwardPlaceholder: => Html)
           (commentsPlaceholder: => Html)
           (mostPopularPlaceholder: => Html)
           (highRelevanceCommercialComponent: => Html)
           (standardCommercialComponent: => Html)
           (outbrainPlaceholder: Html): Html = {

    val htmlBlocks = if (isAdvertisementFeature) {

      // majority of footer components we don't want to appear on advertisement feature articles
      Seq(storyPackagePlaceholder)

    } else {

      def optional(p: => Boolean, htmlBlock: => Html): Option[Html] = if (p) Some(htmlBlock) else None

      def includeOutbrainPlaceholder(htmlBlocks: Seq[Html]): Seq[Html] = {
        if (content.showFooterContainers && !content.shouldHideAdverts && OutbrainSwitch.isSwitchedOn) {
          (htmlBlocks.take(2) :+ outbrainPlaceholder) ++ htmlBlocks.drop(2)
        } else htmlBlocks
      }

      val apartFromOutbrain = Seq(
        optional(!content.shouldHideAdverts, highRelevanceCommercialComponent),
        optional(related.hasStoryPackage && content.showInRelated, storyPackagePlaceholder),
        Some(onwardPlaceholder),
        optional(content.isCommentable, commentsPlaceholder),
        Some(mostPopularPlaceholder),
        optional(!content.shouldHideAdverts, standardCommercialComponent)
      ).flatten

      includeOutbrainPlaceholder(apartFromOutbrain)
    }

    HtmlFormat.fill(htmlBlocks)
  }

}
