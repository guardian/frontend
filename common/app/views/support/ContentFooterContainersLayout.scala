package views.support

import conf.switches.Switches.{OutbrainSwitch, showPaidSeriesContainer}
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
           (externalContentPlaceholder: Html): Html = {

    def optional(p: => Boolean, htmlBlock: => Html): Option[Html] = if (p) Some(htmlBlock) else None

    val htmlBlocks = if (isAdvertisementFeature) {

      // majority of footer components we don't want to appear on advertisement feature articles
      Seq(
          optional(!content.shouldHideAdverts, highRelevanceCommercialComponent),
          Some(storyPackagePlaceholder),
          optional(showPaidSeriesContainer.isSwitchedOn, onwardPlaceholder)
      ).flatten

    } else {

      def includeExternalContentPlaceholder(htmlBlocks: Seq[Html]): Seq[Html] = {
        if (content.showFooterContainers && !content.shouldHideAdverts && OutbrainSwitch.isSwitchedOn) {
          val pos = if ((content.isSeries || content.isBlog) && !related.hasStoryPackage) {
            // Essentially, is the related content slot there but empty
            3
          } else if (related.hasStoryPackage || content.showInRelated) {
            2
          } else {
            4
          }
          (htmlBlocks.take(pos) :+ externalContentPlaceholder) ++ htmlBlocks.drop(pos)
        } else htmlBlocks
      }

      val apartFromOutbrain = Seq(
        optional(!content.shouldHideAdverts, highRelevanceCommercialComponent),
        Some(storyPackagePlaceholder),
        Some(onwardPlaceholder),
        optional(content.trail.isCommentable, commentsPlaceholder),
        Some(mostPopularPlaceholder),
        optional(!content.shouldHideAdverts, standardCommercialComponent)
      ).flatten

      includeExternalContentPlaceholder(apartFromOutbrain)
    }

    HtmlFormat.fill(htmlBlocks)
  }

}
