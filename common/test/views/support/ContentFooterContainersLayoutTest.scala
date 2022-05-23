package views.support

import com.gu.contentapi.client.model.v1.{ContentFields, TagType}
import contentapi.FixtureTemplates.{emptyApiContent, emptyTag}
import model.{RelatedContent, RelatedContentItem}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.twirl.api.Html

class ContentFooterContainersLayoutTest extends AnyFlatSpec with Matchers {

  private def contentItem(
      showInRelatedContent: Boolean = true,
      shouldHideAdverts: Boolean = false,
      commentable: Boolean = true,
      seriesId: Option[String] = None,
      blogId: Option[String] = None,
  ): RelatedContentItem = {
    val seriesTag = for (id <- seriesId) yield emptyTag.copy(id = s"$id/$id", `type` = TagType.Series)
    val blogTag = for (id <- blogId) yield emptyTag.copy(id = s"$id/$id", `type` = TagType.Blog)
    val articleType = Some(emptyTag.copy(id = "type/article", `type` = TagType.Type))

    val tags = List(seriesTag, blogTag, articleType).flatten
    RelatedContentItem(
      emptyApiContent.copy(
        fields = Some(
          ContentFields(
            showInRelatedContent = Some(showInRelatedContent),
            shouldHideAdverts = Some(shouldHideAdverts),
            commentable = Some(commentable),
          ),
        ),
        tags = tags,
      ),
    )
  }

  private val relatedContent: RelatedContent = RelatedContent(Seq(contentItem()))

  private val emptyRelatedContent: RelatedContent = RelatedContent(Nil)

  private def buildHtml(
      item: RelatedContentItem,
      related: RelatedContent = relatedContent,
      isPaidContent: Boolean = false,
  ): Html = {
    ContentFooterContainersLayout(item.content.content, isPaidContent) {
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
    }
  }

  it should "show all footer containers in right order by default" in {
    val html = buildHtml(contentItem())
    html.toString shouldBe
      "storyPackageHtml onwardHtml commentsHtml mostPopularHtml " +
        "standardCommercialHtml "
  }

  it should "omit commercial containers on sensitive content" in {
    val html = buildHtml(contentItem(shouldHideAdverts = true))
    html.toString shouldBe "storyPackageHtml onwardHtml commentsHtml mostPopularHtml "
  }

  it should "just show the story package, commercial container and onward placeholder on ad features" in {
    val html = buildHtml(contentItem(), isPaidContent = true)
    html.toString shouldBe "highRelevanceCommercialHtml storyPackageHtml onwardHtml "
  }

  it should "omit comments when article won't allow them" in {
    val html = buildHtml(contentItem(commentable = false))
    html.toString shouldBe
      "storyPackageHtml onwardHtml mostPopularHtml standardCommercialHtml "
  }

  it should "include story package placeholder even when there's no story package to show" in {
    val html = buildHtml(contentItem(showInRelatedContent = false), emptyRelatedContent)
    html.toString shouldBe
      "storyPackageHtml onwardHtml commentsHtml mostPopularHtml " +
        "standardCommercialHtml "
  }

  it should "show containers in correct order when article doesn't have story package but has related content" in {
    val html = buildHtml(contentItem(), emptyRelatedContent)
    html.toString shouldBe
      "storyPackageHtml onwardHtml commentsHtml mostPopularHtml " +
        "standardCommercialHtml "
  }
}
