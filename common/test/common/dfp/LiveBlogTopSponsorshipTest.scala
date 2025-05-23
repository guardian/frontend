package common.dfp

import com.gu.contentapi.client.model.v1.TagType
import common.Edition
import common.editions.{Uk, Us}
import model.{Tag, TagProperties}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class LiveBlogTopSponsorshipTest extends AnyFlatSpec with Matchers {
  def mkLiveBlogTopSponsorship(
      lineItemName: String = "test-sponsorship",
      lineItemId: Long = 7000726282L,
      sections: Seq[String] = Seq.empty,
      editions: Seq[Edition] = Seq.empty,
      keywords: Seq[String] = Seq.empty,
      adTest: Option[String] = Some("ad-test-param"),
      targetsAdTest: Boolean = true,
  ): LiveBlogTopSponsorship = {
    LiveBlogTopSponsorship(lineItemName, lineItemId, sections, editions, keywords, adTest, targetsAdTest)
  }

  def mkTag(
      tagId: String = "sport/cricket",
      tagSection: String = "sport",
      tagType: String = "Keyword",
  ): Tag = {
    Tag(
      properties = TagProperties(
        id = tagId,
        url = s"https://content.guardianapis.com/$tagId",
        tagType = tagType,
        sectionId = tagSection,
        sectionName = tagSection,
        webTitle = tagId.split("/").last,
        webUrl = s"https://www.theguardian.com/$tagId",
        twitterHandle = None,
        bio = None,
        description = None,
        emailAddress = None,
        contributorLargeImagePath = None,
        bylineImageUrl = None,
        podcast = None,
        references = Seq.empty,
        paidContentType = None,
        commercial = None,
      ),
      pagination = None,
      richLinkId = None,
    )
  }

  "matchesKeywordTargeting" should "be true if there is no keyword targeting on the sponsorship" in {
    val cricketKeywordTag = mkTag()
    val liveBlogTopSponsorship = mkLiveBlogTopSponsorship(keywords = Seq.empty)
    liveBlogTopSponsorship.matchesKeywordTargeting(Seq(cricketKeywordTag)) shouldBe true
  }

  it should "be true if sponsorship keyword targeting matches article keyword tags" in {
    val cricketKeywordTag = mkTag()
    val liveBlogTopSponsorship = mkLiveBlogTopSponsorship(keywords = Seq("cricket"))
    liveBlogTopSponsorship.matchesKeywordTargeting(Seq(cricketKeywordTag)) shouldBe true
  }

  it should "be false if sponsorship keyword targeting does not match article keyword tags" in {
    val cricketKeywordTag = mkTag()
    val liveBlogTopSponsorship = mkLiveBlogTopSponsorship(keywords = Seq("football"))
    liveBlogTopSponsorship.matchesKeywordTargeting(Seq(cricketKeywordTag)) shouldBe false
  }

  "matchesEditionTargeting" should "be true if no editions in sponsorship" in {
    val liveBlogTopSponsorship = mkLiveBlogTopSponsorship(editions = Seq.empty)
    liveBlogTopSponsorship.matchesEditionTargeting(Uk) shouldBe true
  }

  it should "be true if edition matches sponsorship" in {
    val liveBlogTopSponsorship = mkLiveBlogTopSponsorship(editions = Seq(Uk))
    liveBlogTopSponsorship.matchesEditionTargeting(Uk) shouldBe true
  }

  it should "be false if edition does not match sponsorship targeted editions" in {
    val liveBlogTopSponsorship = mkLiveBlogTopSponsorship(editions = Seq(Uk))
    liveBlogTopSponsorship.matchesEditionTargeting(Us) shouldBe false
  }
}
