package views.support

import conf.Switches.OutbrainSwitch
import contentapi.FixtureTemplates
import model.{Article, Content, RelatedContent}
import org.scalatest.{FlatSpec, Matchers}
import play.twirl.api.Html

class ContentFooterContainersLayoutTest extends FlatSpec with Matchers {

  OutbrainSwitch.switchOn()

  private def contentItem(showInRelatedContent: Boolean = true,
                          shouldHideAdverts: Boolean = false,
                          commentable: Boolean = true): Content = {
    new Article(FixtureTemplates.emptyApiContent.copy(fields = Some(Map(
      "showInRelatedContent" -> showInRelatedContent.toString,
      "shouldHideAdverts" -> shouldHideAdverts.toString,
      "commentable" -> commentable.toString
    ))))
  }

  private def relatedContent(): RelatedContent = RelatedContent(Seq(contentItem()))

  private def buildHtml(content: Content, related: RelatedContent, isAdFeature: Boolean = false): Html = {
    ContentFooterContainersLayout(content, related, isAdFeature) {
      Html("storyPackageHtml ")
    } {
      Html("onwardHtml ")
    } {
      Html("commentsHtml ")
    } {
      Html("mostPopularHtml ")
    } {
      Html("highRelevanceCommercialHtml ")
    } {
      Html("standardCommercialHtml ")
    } {
      Html("outbrainHtml ")
    }
  }

  it should "show all footer containers in right order by default" in {
    val html = buildHtml(contentItem(), relatedContent())
    html.toString shouldBe
      "highRelevanceCommercialHtml storyPackageHtml outbrainHtml onwardHtml commentsHtml mostPopularHtml " +
        "standardCommercialHtml "
  }

  it should "omit commercial containers on sensitive content" in {
    val html = buildHtml(contentItem(shouldHideAdverts = true), relatedContent())
    html.toString shouldBe "storyPackageHtml onwardHtml commentsHtml mostPopularHtml "
  }

  it should "just show the story package on ad features" in {
    val html = buildHtml(contentItem(), relatedContent(), isAdFeature = true)
    html.toString shouldBe "storyPackageHtml "
  }

  it should "omit commits when article won't allow them" in {
    val html = buildHtml(contentItem(commentable = false), relatedContent())
    html.toString shouldBe
      "highRelevanceCommercialHtml storyPackageHtml outbrainHtml onwardHtml mostPopularHtml standardCommercialHtml "
  }

  it should "omit story package placeholder when there's no story package to show" in {
    val html = buildHtml(contentItem(showInRelatedContent = false), relatedContent())
    html.toString shouldBe
      "highRelevanceCommercialHtml onwardHtml outbrainHtml commentsHtml mostPopularHtml standardCommercialHtml "
  }
}
