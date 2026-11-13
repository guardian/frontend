package services

import java.time.ZoneOffset
import com.gu.contentapi.client.model.v1.{TagType, Content => ApiContent, Tag => ApiTag}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime
import com.gu.facia.api.models.PublicationStatus.{Draft, Live}
import com.gu.facia.client.models.TargetedPageType.{Article, Front, HasTag}
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

  private def subnav(id: String, pages: List[TargetedPage], url: Option[String] = None): CustomSubnav =
    CustomSubnav(
      id = id,
      header = CustomSubnavHeader(headerText = "subnav 1", dotcomPath = url, copy = "copy"),
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

  private def agentWith(
      config: CustomSubnavConfig,
      appIdentity: ApplicationIdentity = ApplicationIdentity("test"),
  ): SubnavAgent =
    new SubnavAgent(appIdentity) {
      override def getSubnavConfig(): Option[CustomSubnavConfig] = Some(config)
    }

  "getSubnavByUrl" should "return None when the config has not loaded" in {
    new SubnavAgent(ApplicationIdentity("test")).getSubnavByUrl("/missing") shouldBe None
  }

  it should "use live data by default and draft data in preview" in {
    val live = subnav("live", Nil, Some("/sport"))
    val draft = subnav("draft", Nil, Some("/sport"))
    val config = CustomSubnavConfig(live = List(live), draft = List(draft))

    agentWith(config).getSubnavByUrl("/sport") shouldBe Some(live)
    agentWith(config).getSubnavByUrl("/sport", Draft) shouldBe Some(draft)
    agentWith(config, ApplicationIdentity("preview")).getSubnavByUrl("/sport") shouldBe Some(draft)
    agentWith(config, ApplicationIdentity("preview")).getSubnavByUrl("/sport", Live) shouldBe Some(live)
    agentWith(config).getSubnavByUrl("/missing") shouldBe None
  }

  it should "use the same publication precedence as front mapping" in {
    val live = subnav("live", List(TargetedPage(Front, "sport")), Some("/sport"))
    val draft = live.copy(id = "draft")
    val configs = List(
      CustomSubnavConfig(live = Nil, draft = Nil),
      CustomSubnavConfig(live = List(live), draft = Nil),
      CustomSubnavConfig(live = Nil, draft = List(draft)),
      CustomSubnavConfig(live = List(live), draft = List(draft)),
      CustomSubnavConfig(
        live = List(live, live.copy(id = "later-live")),
        draft = List(draft, draft.copy(id = "later-draft")),
      ),
    )

    for {
      config <- configs
      status <- List(Live, Draft)
    } {
      val agent = agentWith(config)
      agent.getSubnavByUrl("/sport", status) shouldBe agent.getSubnavForFront("sport", status)
    }
  }

  it should "match the header URL independently of targeted pages" in {
    val matching = subnav("matching", Nil, Some("/sport"))
    val noUrl = subnav("no-url", List(TargetedPage(Front, "sport")))
    val agent = agentWith(CustomSubnavConfig(live = List(noUrl, matching), draft = Nil))

    agent.getSubnavByUrl("/sport") shouldBe Some(matching)
    agent.getSubnavByUrl("/missing") shouldBe None
    agent.getSubnavForFront("sport") shouldBe Some(noUrl)
  }

  it should "resolve editor URLs by subnav ID with draft precedence" in {
    val live = subnav("4c1bf2d9-ee4f-4d4c-829a-9bcc2c25b9fb", Nil)
    val draft = live.copy(updatedBy = "draft editor")
    val agent = agentWith(CustomSubnavConfig(live = List(live), draft = List(draft)))
    val url = s"https://fronts.local.dev-gutools.co.uk/v2/subnavs/${live.id}"

    agent.getSubnavByUrl(url) shouldBe Some(live)
    agent.getSubnavByUrl(s"$url/?x=1", Draft) shouldBe Some(draft)
    agent.getSubnavByUrl(s"$url#section") shouldBe Some(live)
    agent.getSubnavByUrl("https://fronts.local.dev-gutools.co.uk/v2/subnavs/missing") shouldBe None
  }

  "getSubnavById" should "return None when the config has not loaded" in {
    new SubnavAgent(ApplicationIdentity("test")).getSubnavById("missing") shouldBe None
  }

  it should "use live data by default and draft data in preview, falling back to live" in {
    val live = subnav("nav", Nil)
    val draft = live.copy(updatedBy = "draft editor")
    val config = CustomSubnavConfig(live = List(live), draft = List(draft))

    agentWith(config).getSubnavById(live.id) shouldBe Some(live)
    agentWith(config).getSubnavById(live.id, Draft) shouldBe Some(draft)
    agentWith(config, ApplicationIdentity("preview")).getSubnavById(live.id) shouldBe Some(draft)
    agentWith(config, ApplicationIdentity("preview")).getSubnavById(live.id, Live) shouldBe Some(live)
    agentWith(config.copy(draft = Nil)).getSubnavById(live.id, Draft) shouldBe Some(live)
    agentWith(config.copy(live = Nil)).getSubnavById(live.id, Live) shouldBe None
    agentWith(config).getSubnavById("missing") shouldBe None
  }

  "getSubnavForFront" should "preserve the client library's front mapping for both publication statuses" in {
    val live = subnav("live", List(TargetedPage(Front, "sport")))
    val draft = live.copy(id = "draft")
    val wrongType = subnav("article", List(articlePage("sport")))
    val configs = List(
      CustomSubnavConfig(live = Nil, draft = Nil),
      CustomSubnavConfig(live = List(live), draft = Nil),
      CustomSubnavConfig(live = Nil, draft = List(draft)),
      CustomSubnavConfig(live = List(live), draft = List(draft)),
      CustomSubnavConfig(live = List(wrongType, live, live.copy(id = "later")), draft = Nil),
    )

    for {
      config <- configs
      status <- List(Live, Draft)
      frontId <- List("sport", "missing")
    } {
      agentWith(config).getSubnavForFront(frontId, status) shouldBe
        com.gu.facia.api.CustomSubnavService.getSubnavForFront(config, frontId, status)
    }
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
