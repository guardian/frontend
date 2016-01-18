package common.dfp

import com.gu.contentapi.client.model.v1.{Tag => ApiTag, TagType => ApiTagType}
import model.Tag
import org.scalatest.{FlatSpec, Matchers}

class InlineMerchandiseComponentAgentTest extends FlatSpec with Matchers {

  private def toTag(tagType: ApiTagType, tagId: String, sectionId: Option[String] = None): Tag = {
    Tag.make(ApiTag(id = tagId,
      `type` = tagType,
      sectionId = sectionId,
      webTitle = "title",
      webUrl = "url",
      apiUrl = "url"))
  }
  private def toKeyword(tagId: String, sectionId: Option[String] = None): Tag = toTag(ApiTagType.Keyword,
    tagId,
    sectionId)
  private def toSeries(tagId: String, sectionId: Option[String] = None): Tag = toTag(ApiTagType.Series,
    tagId,
    sectionId)

  private object TestAgent extends InlineMerchandiseComponentAgent {
    override protected def inlineMerchandisingTargetedTags: InlineMerchandisingTagSet =
      InlineMerchandisingTagSet(keywords = Set("ad-feature", "film"))
  }

  "hasInlineMerchandise" should "be true if tag id has inline merchandising" in {
    TestAgent.hasInlineMerchandise(Seq(toKeyword("advert/ad-feature"))) should be(true)
  }

  it should "be true if keyword tag exists" in {
    val tags = Seq(
      toKeyword("culture/article"),
      toKeyword("advert/ad-feature")
    )
    TestAgent.hasInlineMerchandise(tags) should be(true)
  }

  it should "be false for a tag id which doesn't have inline merchandising" in {
    TestAgent.hasInlineMerchandise(Seq(toKeyword("culture/article"))) should be(false)
  }

  it should "be false if keyword tag doesn't exists" in {
    val tags = Seq(toKeyword("culture/article"), toSeries("advert/ad-feature"))
    TestAgent.hasInlineMerchandise(tags) should be(false)
  }
}
