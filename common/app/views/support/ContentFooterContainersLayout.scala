package views.support

import conf.switches.Switches.OutbrainSwitch
import model.{Content, RelatedContentPackage}
import play.twirl.api.{Html, HtmlFormat}

import scala.collection.immutable.Seq

object ContentFooterContainersLayout {

  def apply(content: Content, related: RelatedContentPackage, isAdvertisementFeature: Boolean)
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
          val pos = if ((content.isSeries || content.isBlog) && !related.hasStoryPackage) {
            3
          } else if (related.hasStoryPackage || content.showInRelated) {
            2
          } else {
            4
          }
          (htmlBlocks.take(pos) :+ outbrainPlaceholder) ++ htmlBlocks.drop(pos)
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

      includeOutbrainPlaceholder(apartFromOutbrain)
    }

    HtmlFormat.fill(htmlBlocks)
  }

}
