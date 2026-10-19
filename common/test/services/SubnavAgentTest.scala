package services

import java.time.ZoneOffset
import com.gu.contentapi.client.model.v1.{TagType, Content => ApiContent, Tag => ApiTag}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime
import com.gu.facia.api.models.PublicationStatus.{Draft, Live}
import com.gu.facia.client.models.TargetedPageType.{Article, HasTag}
import com.gu.facia.client.models.{
  CustomSubnav,
  CustomSubnavConfig,
  CustomSubnavFormat,
  CustomSubnavHeader,
  TargetedPage,
}
import implicits.Dates.jodaToJavaInstant
import model.{ApplicationIdentity, Content}
import org.joda.time.DateTime
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.play.guice.GuiceOneAppPerSuite

class SubnavAgentTest extends AnyFlatSpec with Matchers with GuiceOneAppPerSuite {

  private def subnav(id: String, pages: List[TargetedPage]): CustomSubnav =
    CustomSubnav(
      id = id,
      header = CustomSubnavHeader(headerText = "subnav 1", dotcomPath = None, copy = "copy"),
      format = CustomSubnavFormat.Large,
      links = Nil,
      pages = pages,
      images = None,
      palette = None,
      lastUpdated = new DateTime(),
      updatedBy = "someone",
      updatedEmail = "someone@example.com",
    )

  private def tag(tagId: String): TargetedPage = TargetedPage(HasTag, tagId)
  private def articlePage(path: String): TargetedPage = TargetedPage(Article, path)

  private def apiTag(id: String) =
    ApiTag(
      id = id,
      `type` = TagType.Keyword,
      webTitle = id,
      webUrl = "does not matter",
      apiUrl = "does not matter",
    )

  private def content(tagIds: List[String]): Content = {
    val apiContent = ApiContent(
      id = "sport/2024/jan/01/some-article",
      sectionId = None,
      sectionName = None,
      webPublicationDate = Some(jodaToJavaInstant(new DateTime()).atOffset(ZoneOffset.UTC).toCapiDateTime),
      webTitle = "Some article",
      webUrl = "http://www.theguardian.com/sport/2024/jan/01/some-article",
      apiUrl = "http://content.guardianapis.com/sport/2024/jan/01/some-article",
      tags = tagIds.map(apiTag),
    )
    Content.make(apiContent)
  }

  private def agentWith(config: CustomSubnavConfig): SubnavAgent =
    new SubnavAgent(ApplicationIdentity("test")) {
      override def getSubnavConfig(): Option[CustomSubnavConfig] = Some(config)
    }

  "getSubnavForContent" should "return None when there is no config" in {
    val agent = new SubnavAgent(ApplicationIdentity("test")) {
      override def getSubnavConfig(): Option[CustomSubnavConfig] = None
    }
    agent.getSubnavForContent(content(List("sport/cycling"))) should be(None)
  }

  it should "return None when nothing matches" in {
    val config = CustomSubnavConfig(live = List(subnav("a", List(tag("sport/football")))), draft = Nil)
    agentWith(config).getSubnavForContent(content(List("sport/cycling"))) should be(None)
  }

  it should "match a subnav targeting a tag on the content" in {
    val matching = subnav("matching", List(tag("sport/cycling")))
    val config = CustomSubnavConfig(live = List(matching), draft = Nil)
    agentWith(config).getSubnavForContent(content(List("sport/cycling"))).map(_.id) should be(Some("matching"))
  }

  it should "prefer a specific-article match over a tag match" in {
    val contentWithCyclingTag = content(List("sport/cycling"))
    val tagSubnav = subnav("tag", List(tag("sport/cycling")))
    val articleSubnav = subnav("article", List(articlePage(contentWithCyclingTag.metadata.id)))
    val config = CustomSubnavConfig(live = List(tagSubnav, articleSubnav), draft = Nil)
    agentWith(config).getSubnavForContent(contentWithCyclingTag).map(_.id) should be(Some("article"))
  }

  it should "match tags in content priority order (first tag wins)" in {
    val contentWithCyclingFirst = content(List("sport/cycling", "sport/football"))
    val footballSubnav = subnav("football", List(tag("sport/football")))
    val cyclingSubnav = subnav("cycling", List(tag("sport/cycling")))
    // Config order deliberately lists football first; cycling should still win as it is the first tag.
    val config = CustomSubnavConfig(live = List(footballSubnav, cyclingSubnav), draft = Nil)
    agentWith(config).getSubnavForContent(contentWithCyclingFirst).map(_.id) should be(Some("cycling"))
  }

  it should "search newest subnavs first when several match the same tag" in {
    val oldest = subnav("oldest", List(tag("sport/cycling")))
    val newest = subnav("newest", List(tag("sport/cycling")))
    // Newest subnavs are appended to the end of the list.
    val config = CustomSubnavConfig(live = List(oldest, newest), draft = Nil)
    agentWith(config).getSubnavForContent(content(List("sport/cycling"))).map(_.id) should be(Some("newest"))
  }

  it should "prefer a draft subnav over a live one when status is Draft (ie we are in Preview)" in {
    val liveSubnav = subnav("live", List(tag("sport/cycling")))
    val draftSubnav = subnav("draft", List(tag("sport/cycling")))
    val config = CustomSubnavConfig(live = List(liveSubnav), draft = List(draftSubnav))
    agentWith(config).getSubnavForContent(content(List("sport/cycling")), Draft).map(_.id) should be(Some("draft"))
  }

  it should "ignore draft subnavs when status is Live" in {
    val draftSubnav = subnav("draft", List(tag("sport/cycling")))
    val config = CustomSubnavConfig(live = Nil, draft = List(draftSubnav))
    agentWith(config).getSubnavForContent(content(List("sport/cycling")), Live) should be(None)
  }
}
