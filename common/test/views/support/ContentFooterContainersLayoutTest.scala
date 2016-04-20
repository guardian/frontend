package views.support

import conf.switches.Switches.OutbrainSwitch
import contentapi.FixtureTemplates.{emptyApiContent, emptyTag}
import model.{RelatedContentItem, RelatedContent}
import org.scalatest.{FlatSpec, Matchers}
import play.twirl.api.Html
import com.gu.contentapi.client.model.v1.{ContentFields, TagType}

class ContentFooterContainersLayoutTest extends FlatSpec with Matchers {

  OutbrainSwitch.switchOn()

  private def contentItem(showInRelatedContent: Boolean = true,
                          shouldHideAdverts: Boolean = false,
                          commentable: Boolean = true,
                          seriesId: Option[String] = None,
                          blogId: Option[String] = None): RelatedContentItem = {
    val seriesTag = for (id <- seriesId) yield emptyTag.copy(id = s"$id/$id", `type` = TagType.Series)
    val blogTag = for (id <- blogId) yield emptyTag.copy(id = s"$id/$id", `type` = TagType.Blog)
    val articleType = Some(emptyTag.copy(id = "type/article", `type` = TagType.Type))

    val tags = List(seriesTag, blogTag, articleType).flatten
    RelatedContentItem(emptyApiContent.copy(
      fields = Some(ContentFields(
        showInRelatedContent = Some(showInRelatedContent),
        shouldHideAdverts = Some(shouldHideAdverts),
        commentable = Some(commentable)
      )),
      tags = tags
    ))
  }

  private val relatedContent: RelatedContent = RelatedContent(Seq(contentItem()))

  private val emptyRelatedContent: RelatedContent = RelatedContent(Nil)

  private def buildHtml(item: RelatedContentItem,
                        related: RelatedContent = relatedContent,
                        isAdFeature: Boolean = false): Html = {
    ContentFooterContainersLayout(item.content.content, related, isAdFeature) {
      Html("storyPackageHtml ")
    } {
      Html("onwardHtml ")
    } {
      Html("sectionFrontHtml ")
    } {
      Html("networkFrontHtml1 ")
    } {
      Html("commentsHtml ")
    } {
      Html("mostPopularHtml ")
    } {
      Html("networkFrontHtml2 ")
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
      "highRelevanceCommercialHtml storyPackageHtml outbrainHtml onwardHtml sectionFrontHtml networkFrontHtml1 commentsHtml mostPopularHtml " +
        "standardCommercialHtml networkFrontHtml2 "
  }

  it should "omit commercial containers on sensitive content" in {
    val html = buildHtml(contentItem(shouldHideAdverts = true))
    html.toString shouldBe "storyPackageHtml onwardHtml sectionFrontHtml networkFrontHtml1 commentsHtml mostPopularHtml networkFrontHtml2 "
  }

  it should "just show the story package on ad features" in {
    val html = buildHtml(contentItem(), isAdFeature = true)
    html.toString shouldBe "storyPackageHtml "
  }

  it should "omit comments when article won't allow them" in {
    val html = buildHtml(contentItem(commentable = false))
    html.toString shouldBe
      "highRelevanceCommercialHtml storyPackageHtml outbrainHtml onwardHtml sectionFrontHtml networkFrontHtml1 mostPopularHtml standardCommercialHtml networkFrontHtml2 "
  }

  it should "include story package placeholder even when there's no story package to show" in {
    val html = buildHtml(contentItem(showInRelatedContent = false), emptyRelatedContent)
    html.toString shouldBe
      "highRelevanceCommercialHtml storyPackageHtml onwardHtml outbrainHtml sectionFrontHtml networkFrontHtml1 commentsHtml mostPopularHtml " +
        "standardCommercialHtml networkFrontHtml2 "
  }

  it should "show onward HTML before outbrain if article is part of a series and has no story package" in {
    val html = buildHtml(contentItem(seriesId = Some("seriesId")), emptyRelatedContent)
    html.toString shouldBe
      "highRelevanceCommercialHtml storyPackageHtml onwardHtml outbrainHtml sectionFrontHtml networkFrontHtml1 commentsHtml mostPopularHtml " +
        "standardCommercialHtml networkFrontHtml2 "
  }

  it should "show onward HTML before outbrain if article is part of a blog and has no story package" in {
    val html = buildHtml(contentItem(blogId = Some("blogId")), emptyRelatedContent)
    html.toString shouldBe
      "highRelevanceCommercialHtml storyPackageHtml onwardHtml outbrainHtml sectionFrontHtml networkFrontHtml1 commentsHtml mostPopularHtml " +
        "standardCommercialHtml networkFrontHtml2 "
  }

  it should "show containers in correct order when article doesn't have story package but has related content" in {
    val html = buildHtml(contentItem(), emptyRelatedContent)
    html.toString shouldBe
      "highRelevanceCommercialHtml storyPackageHtml outbrainHtml onwardHtml sectionFrontHtml networkFrontHtml1 commentsHtml mostPopularHtml " +
        "standardCommercialHtml networkFrontHtml2 "
  }
}
