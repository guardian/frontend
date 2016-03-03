package views.support

import conf.switches.Switches.OutbrainSwitch
import model.{Content, RelatedContent}
import play.twirl.api.{Html, HtmlFormat}

import scala.collection.immutable.Seq

object ContentFooterContainersLayout {

  def apply(content: Content, related: RelatedContent, isAdvertisementFeature: Boolean)
           (storyPackagePlaceholder: => Html)
           (onwardPlaceholder: => Html)
           (sectionFrontContainers: => Html)
           (networkFrontContainers1: => Html)
           (commentsPlaceholder: => Html)
           (mostPopularPlaceholder: => Html)
           (networkFrontContainers2: => Html)
           (highRelevanceCommercialComponent: => Html)
           (standardCommercialComponent: => Html)
           (externalContentPlaceholder: Html): Html = {

    val htmlBlocks = if (isAdvertisementFeature) {

      // majority of footer components we don't want to appear on advertisement feature articles
      Seq(storyPackagePlaceholder)

    } else {

      def optional(p: => Boolean, htmlBlock: => Html): Option[Html] = if (p) Some(htmlBlock) else None

      def includeExternalContentPlaceholder(htmlBlocks: Seq[Html]): Seq[Html] = {
        if (content.showFooterContainers && !content.shouldHideAdverts && OutbrainSwitch.isSwitchedOn) {
          val pos = if (((content.isSeries || content.isBlog) && !related.hasStoryPackage) || (!content.showInRelated && !related.hasStoryPackage)) {
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
        Some(sectionFrontContainers),
        Some(networkFrontContainers1),
        optional(content.trail.isCommentable, commentsPlaceholder),
        Some(mostPopularPlaceholder),
        optional(!content.shouldHideAdverts, standardCommercialComponent),
        Some(networkFrontContainers2)
      ).flatten

      includeExternalContentPlaceholder(apartFromOutbrain)
    }

    HtmlFormat.fill(htmlBlocks)
  }

}
