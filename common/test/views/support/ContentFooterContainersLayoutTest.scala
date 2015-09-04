package views.support

import conf.Switches.OutbrainSwitch
import contentapi.FixtureTemplates.{emptyApiContent, emptyTag}
import model.{Article, Content, RelatedContent}
import org.scalatest.{FlatSpec, Matchers}
import play.twirl.api.Html

class ContentFooterContainersLayoutTest extends FlatSpec with Matchers {

  OutbrainSwitch.switchOn()

  private def contentItem(showInRelatedContent: Boolean = true,
                          shouldHideAdverts: Boolean = false,
                          commentable: Boolean = true,
                          seriesId: Option[String] = None): Content = {
    val tags = (for (id <- seriesId) yield List(emptyTag.copy(id = id, `type` = "series"))) getOrElse Nil
    new Article(emptyApiContent.copy(
      fields = Some(Map(
      "showInRelatedContent" -> showInRelatedContent.toString,
      "shouldHideAdverts" -> shouldHideAdverts.toString,
      "commentable" -> commentable.toString
      )),
      tags = tags
    ))
  }

  private val relatedContent: RelatedContent = RelatedContent(Seq(contentItem()))

  private val emptyRelatedContent: RelatedContent = RelatedContent(Nil)

  private def buildHtml(content: Content,
                        related: RelatedContent = relatedContent,
                        isAdFeature: Boolean = false): Html = {
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
    val html = buildHtml(contentItem())
    html.toString shouldBe
      "highRelevanceCommercialHtml storyPackageHtml outbrainHtml onwardHtml commentsHtml mostPopularHtml " +
        "standardCommercialHtml "
  }

  it should "omit commercial containers on sensitive content" in {
    val html = buildHtml(contentItem(shouldHideAdverts = true))
    html.toString shouldBe "storyPackageHtml onwardHtml commentsHtml mostPopularHtml "
  }

  it should "just show the story package on ad features" in {
    val html = buildHtml(contentItem(), isAdFeature = true)
    html.toString shouldBe "storyPackageHtml "
  }

  it should "omit comments when article won't allow them" in {
    val html = buildHtml(contentItem(commentable = false))
    html.toString shouldBe
      "highRelevanceCommercialHtml storyPackageHtml outbrainHtml onwardHtml mostPopularHtml standardCommercialHtml "
  }

  it should "include story package placeholder even when there's no story package to show" in {
    val html = buildHtml(contentItem(showInRelatedContent = false))
    html.toString shouldBe
      "highRelevanceCommercialHtml storyPackageHtml onwardHtml commentsHtml outbrainHtml mostPopularHtml " +
        "standardCommercialHtml "
  }

  it should "show onward HTML before outbrain if article is part of a series and has no story package" in {
    val html = buildHtml(contentItem(seriesId = Some("seriesId")), emptyRelatedContent)
    html.toString shouldBe
      "highRelevanceCommercialHtml storyPackageHtml onwardHtml outbrainHtml commentsHtml mostPopularHtml " +
        "standardCommercialHtml "
  }
}
