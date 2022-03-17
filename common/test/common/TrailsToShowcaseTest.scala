package common

import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime
import com.gu.facia.api.utils.Editorial
import com.sun.syndication.feed.module.mediarss.MediaEntryModule
import com.sun.syndication.feed.synd.SyndPerson
import implicits.Dates.jodaToJavaInstant
import model.pressed._
import model.{ImageAsset, ImageMedia}
import org.joda.time.DateTime
import org.scalatest.{FlatSpec, Matchers}
import play.api.test.FakeRequest

import java.time.ZoneOffset
import scala.collection.JavaConverters._
import scala.xml.{Node, XML}

class TrailsToShowcaseTest extends FlatSpec with Matchers {

  val request = FakeRequest()

  val imageMedia: ImageMedia = {
    val asset = ImageAsset(
      fields = Map(
        "width" -> "1200",
        "height" -> "1000",
      ),
      mediaType = "",
      mimeType = Some("image/jpeg"),
      url = Some("http://localhost/trail.jpg"),
    )
    ImageMedia(Seq(asset))
  }

  val replacedImage = Replace("http://localhost/replaced-image.jpg", "1200", "1000")

  val smallImageMedia: ImageMedia = {
    val asset = ImageAsset(
      fields = Map(
        "width" -> "320",
        "height" -> "200",
      ),
      mediaType = "",
      mimeType = Some("image/jpeg"),
      url = Some("http://localhost/trail.jpg"),
    )
    ImageMedia(Seq(asset))
  }

  val mediumImageMedia: ImageMedia = {
    val asset = ImageAsset(
      fields = Map(
        "width" -> "1024",
        "height" -> "768",
      ),
      mediaType = "",
      mimeType = Some("image/jpeg"),
      url = Some("http://localhost/trail.jpg"),
    )
    ImageMedia(Seq(asset))
  }

  val wayBackWhen = new DateTime(2021, 3, 2, 12, 30, 1)
  val lastModifiedWayBackWhen = wayBackWhen.plusHours(1)

  val twoEncodedBulletItems =
    """
      | - Bullet 1
      |
      |-Bullet 2
      |""".stripMargin

  "TrailsToShowcase" should "set module namespaces in feed header" in {
    val singleStoryTrails =
      Seq(
        makePressedContent(
          webPublicationDate = wayBackWhen,
          trailPicture = Some(imageMedia),
          trailText = Some(twoEncodedBulletItems),
        ),
      )

    val rss = XML.loadString(
      TrailsToShowcase
        .fromTrails(Option("foo"), singleStoryTrails, Seq.empty, "rundown-panel-id")(request),
    )

    rss.getNamespace("g") should be("http://schemas.google.com/pcn/2020")
    rss.getNamespace("media") should be("http://search.yahoo.com/mrss/")
  }

  "TrailsToShowcase" should "propogate media module usage up from rundown panel articles" in {
    val content = makePressedContent(
      webPublicationDate = wayBackWhen,
      trailPicture = Some(imageMedia),
      kickerText = Some("Kicker"),
      headline = "My panel title | My headline",
    )

    val rss = XML.loadString(
      TrailsToShowcase.fromTrails(
        Option("foo"),
        Seq.empty,
        Seq(content, content, content),
        "rundown-panel-id",
      )(request),
    )

    // Given no single story panels and a rundown panel the media module needs to propogate from the rundown panel
    val channelItems = rss \ "channel" \ "item"

    val singleStoryPanels = channelItems.filter(ofSingleStoryPanelType)
    singleStoryPanels.size should be(0)
    val rundownPanels = channelItems.filter(ofRundownPanelType)
    rundownPanels.size should be(1)

    rss.getNamespace("media") should be("http://search.yahoo.com/mrss/")
  }

  "TrailsToShowcase" can "render feed with Single Story and Rundown panels" in {
    val bulletEncodedTrailText =
      """
    - Bullet 1
     - Bullet 2
     - Bullet 3
    """

    val singleStoryContent = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      byline = Some("Trail byline"),
      kickerText = Some("Kicker"),
      trailText = Some(bulletEncodedTrailText),
      headline = "My panel title | My headline",
    )
    val rundownArticleContent = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      byline = Some("Trail byline"),
      headline = "My rundown panel title | My headline",
    )
    val singleStoryTrails = Seq(singleStoryContent)
    val rundownTrails = Seq(rundownArticleContent, rundownArticleContent, rundownArticleContent)

    val rss = XML.loadString(
      TrailsToShowcase.fromTrails(
        Option("foo"),
        singleStoryTrails,
        rundownTrails,
        "rundown-container-id",
      )(request),
    )

    val channelItems = rss \ "channel" \ "item"
    val singleStoryPanels = channelItems.filter(ofSingleStoryPanelType)
    singleStoryTrails.size should be(1)

    val singleStoryPanel = singleStoryPanels.head
    (singleStoryPanel \ "panel_title").filter(_.prefix == "g").text should be("My panel title")
    (singleStoryPanel \ "title").text should be("My headline")
    (singleStoryPanel \ "guid").text should be(
      "https://www.theguardian.com/sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report",
    )
    (singleStoryPanel \ "link").text should be(
      "https://www.theguardian.com/sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report",
    )
    (singleStoryPanel \ "author").head.text should be("Trail byline")
    // Single story panels are allowed to have author and kicker at the same time
    (singleStoryPanel \ "overline").filter(_.prefix == "g").head.text should be(
      "Kicker",
    )

    // Check date fields
    (singleStoryPanel \ "pubDate").text should be("Tue, 02 Mar 2021 12:30:01 GMT")
    (singleStoryPanel \ "updated").filter(_.prefix == "atom").text should be("2021-03-02T13:30:01Z")

    val singleStoryPanelMedia = (singleStoryPanel \ "content").filter(_.prefix == "media")
    singleStoryPanelMedia.size should be(1)
    singleStoryPanelMedia.head.attribute("url").head.text shouldBe "http://localhost/trail.jpg"

    // Bullet list rendering
    val bulletListElement = (singleStoryPanel \ "bullet_list").filter(_.prefix == "g")
    bulletListElement.nonEmpty shouldBe (true)
    val bulletListItems = (bulletListElement \ "list_item").filter(_.prefix == "g")
    bulletListItems.size should be(3)
    bulletListItems.head.text should be("Bullet 1")

    // Rundown panel
    val rundownPanels = channelItems.filter(ofRundownPanelType)
    rundownPanels.size should be(1)

    val rundownPanel = rundownPanels.head
    val rundownPanelGuid = (rundownPanel \ "guid").head

    rundownPanelGuid.text should be(s"rundown-container-id--1679333355")
    rundownPanelGuid.attribute("isPermaLink").get.head.text should be("false")

    (rundownPanel \ "panel_title").filter(_.prefix == "g").head.text should be("My rundown panel title")

    (rundownPanel \ "pubDate").text should be("Tue, 02 Mar 2021 12:30:01 GMT")
    (rundownPanel \ "updated").filter(_.prefix == "atom").text should be("2021-03-02T13:30:01Z")

    val rundownPanelMedia = (rundownPanel \ "content").filter(_.prefix == "media")
    rundownPanelMedia.size should be(0)

    // Rundown panels content nested items in the single article group
    val articleGroups = (rundownPanel \ "article_group").filter(_.prefix == "g")
    articleGroups.size should be(1)
    val articleGroup = articleGroups.head
    articleGroup.attribute("role").get.head.text should be("RUNDOWN")

    // Examine the nested article items
    val articles = articleGroup \ "item"
    articles.size should be(3)

    val rundownArticle = articles.head
    (rundownArticle \ "guid").text should be(
      "https://www.theguardian.com/sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report",
    )
    (rundownArticle \ "title").text should be("My headline")
    (rundownArticle \ "link").text should be(
      "https://www.theguardian.com/sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report",
    )
    (rundownArticle \ "author").text should be("Trail byline")

    (rundownArticle \ "pubDate").text should be("Tue, 02 Mar 2021 12:30:01 GMT")
    (rundownArticle \ "updated").filter(_.prefix == "atom").text should be("2021-03-02T13:30:01Z")
    (rundownArticle \ "content").filter(_.prefix == "media").head.attribute("url").get.head.text should be(
      "http://localhost/trail.jpg",
    )
  }

  "TrailsToShowcase" can "render rundown panels articles with kickers" in {
    val withKicker = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      kickerText = Some("A kicker"),
      headline = "My panel title | My headline",
    )
    val rundownTrails = Seq(withKicker, withKicker, withKicker)

    val rss = XML.loadString(
      TrailsToShowcase.fromTrails(
        Option("foo"),
        Seq.empty,
        rundownTrails,
        "rundown-container-id",
      )(request),
    )

    val channelItems = rss \ "channel" \ "item"
    val rundownPanel = channelItems.filter(ofRundownPanelType).head
    val articleGroup = (rundownPanel \ "article_group").filter(_.prefix == "g").head
    val articles = articleGroup \ "item"
    val rundownArticle = articles.head

    (rundownArticle \ "overline").text should be("A kicker")
  }

  "TrailsToShowcase" should "render item single story bylines on author tag rather than dc:creator" in {
    // Showcase expects a byline (ie. 'By An Author') on the author tag.
    // The RSS spec says that this tag is for the email address of the item author.
    // Most RSS implementations put the byline on the dc:creator field.
    // For Showcase we need to make the byline appear on the author tag.
    val withByline = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      trailText = Some(twoEncodedBulletItems),
      byline = Some("I showed up on the author tag right?"),
    )

    val rss = XML.loadString(
      TrailsToShowcase.fromTrails(
        Option("foo"),
        Seq(withByline),
        Seq.empty,
        "rundown-container-id",
      )(request),
    )

    val channelItems = rss \ "channel" \ "item"
    val panel = channelItems.filter(ofSingleStoryPanelType).head

    (panel \ "author").text should be("I showed up on the author tag right?")
  }

  "TrailToShowcase" should "omit rundown panel if there are no rundown trails" in {
    val singleStoryTrails =
      Seq(makePressedContent(webPublicationDate = wayBackWhen, trailPicture = Some(imageMedia)))

    val rss = XML.loadString(TrailsToShowcase.fromTrails(Option("foo"), singleStoryTrails, Seq.empty, "")(request))

    val rundownPanels = (rss \ "channel" \ "item").filter(ofRundownPanelType)
    rundownPanels.size should be(0)
  }

  "TrailToShowcase" can "create Single Story panels from single trails" in {
    val curatedContent = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      headline = "My unique headline",
      byline = Some("Trail byline"),
      kickerText = Some("A Kicker"),
      trailText = Some(twoEncodedBulletItems),
    )

    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(curatedContent).toOption.get
    singleStoryPanel.title should be("My unique headline")

    singleStoryPanel.link should be(
      "https://www.theguardian.com/sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report",
    )
    singleStoryPanel.author should be(Some("Trail byline"))

    singleStoryPanel.`type` should be("SINGLE_STORY")
    singleStoryPanel.panelTitle should be(None) // Specifically omitted
    singleStoryPanel.overline should be(Some("A Kicker"))

    singleStoryPanel.published should be(wayBackWhen)
    singleStoryPanel.updated should be(lastModifiedWayBackWhen)

    // Single panel stories require a media element which we take from the mayBeContent trail
    singleStoryPanel.imageUrl should be("http://localhost/trail.jpg")
  }

  "TrailToShowcase" should "strip all markup from single story text elements" in {
    // Showcase specifies no markup in text elements; out trail texts often contains strong tags and others.
    // Strip them to provide the least friction to editors
    val bulletItemsWithHtml =
      """
        |-<p>Bullet 1</p>
        |- <strong>Bullet 2</strong>
        |-<b>Unclosed
        |""".stripMargin

    val curatedContent = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      headline = "<strong>My Panel title</strong> | My <i>unique</i> headline",
      byline = Some("<b>Trail</b> byline"),
      kickerText = Some("<strong>A kicker</strong>"),
      trailText = Some(bulletItemsWithHtml),
    )

    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(curatedContent).toOption.get

    singleStoryPanel.panelTitle shouldBe (Some("My Panel title"))
    singleStoryPanel.title shouldBe ("My unique headline")
    singleStoryPanel.author shouldBe (Some("Trail byline"))
    singleStoryPanel.overline shouldBe (Some("A kicker"))

    val bulletItems = singleStoryPanel.bulletList.get.listItems
    bulletItems.head.text should be("Bullet 1")
    bulletItems.last.text should be("Unclosed")
  }

  "TrailToShowcase" can "marshall Single Story panels to Rome RSS entries" in {
    // Asserting the specifics of how we set up the Rome entries for a single story panel
    val sublink =
      makePressedContent(
        webPublicationDate = wayBackWhen,
        lastModified = Some(lastModifiedWayBackWhen),
        trailPicture = Some(imageMedia),
        kickerText = Some("Sublink Kicker"),
      )

    val curatedContent = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      headline = "My panel title | My unique headline",
      byline = Some("Trail byline"),
      kickerText = Some("A kicker"),
      trailText = Some("Trailtext"),
      supportingContent = Seq(sublink, sublink),
    )
    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(curatedContent).toOption.get

    val entry = TrailsToShowcase.asSyndEntry(singleStoryPanel)

    entry.getTitle should be("My unique headline")
    entry.getDescription.getValue should be("Trailtext")

    // Showcase's use of the RSS author tag is slightly off spec; they use it to pass free text where the standard is expecting an email address
    // We use a person with an email address to get the free form byline through Rome and onto the author tag
    // See https://github.com/rometools/rome/blob/001d1cca5448817a031e3746f417519652ede4e9/rome/src/main/java/com/rometools/rome/feed/synd/impl/ConverterForRSS094.java#L139
    val authorsEmail = entry.getAuthors().asScala.headOption.flatMap {
      case person: SyndPerson => Some(person.getEmail)
      case _                  => None
    }
    authorsEmail should be(Some("Trail byline"))

    val gModule = entry.getModule(GModule.URI).asInstanceOf[GModule]
    val gPanel = gModule.getPanel
    gPanel shouldNot be(None)
    gPanel.get.`type` should be("SINGLE_STORY")
    gPanel.get.content should be("My unique headline")

    gModule.getPanelTitle should be(Some("My panel title"))
    gModule.getOverline should be(Some("A kicker"))
    gModule.getArticleGroup.nonEmpty should be(true)

    entry.getPublishedDate should be(wayBackWhen.toDate)
    val rssAtomModule = entry.getModule(RssAtomModule.URI).asInstanceOf[RssAtomModule]
    rssAtomModule.getUpdated should be(Some(lastModifiedWayBackWhen))

    val mediaModule = entry.getModule("http://search.yahoo.com/mrss/").asInstanceOf[MediaEntryModule]
    mediaModule.getMediaContents.size should be(1)
    mediaModule.getMediaContents.head.getReference() should be(
      new com.sun.syndication.feed.module.mediarss.types.UrlReference("http://localhost/trail.jpg"),
    )
  }

  "TrailToShowcase" can "encode single story panel related articles from supporting content" in {
    val subLink = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      headline = "A sublink",
      kickerText = Some("A kicker"),
    )

    val withSupportingContent = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      trailText = Some("On a related article panel the trail text should become the panel description"),
      supportingContent = Seq(subLink, subLink),
    )

    val outcome = TrailsToShowcase.asSingleStoryPanel(withSupportingContent)

    outcome.left.toOption.isEmpty should be(true)
    val singleStoryRelatedArticlesPanel = outcome.right.get
    singleStoryRelatedArticlesPanel.articleGroup.nonEmpty shouldBe (true)
    singleStoryRelatedArticlesPanel.articleGroup.get.role shouldBe ("RELATED_CONTENT")
    singleStoryRelatedArticlesPanel.articleGroup.get.articles.size shouldBe (2)
    singleStoryRelatedArticlesPanel.articleGroup.get.articles.head.title shouldBe ("A sublink")

    singleStoryRelatedArticlesPanel.summary shouldBe (Some(
      "On a related article panel the trail text should become the panel description",
    ))
  }

  "TrailToShowcase" should "validate single story trails with sublinks as related article panels" in {
    val longerThan54 = "A sublink with a title which is way to long " +
      "A sublink with a title which is way to long " +
      "A sublink with a title which is way to long"
    longerThan54.length > 54 should be(true)

    val subLink = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      headline = "A sublink",
      kickerText = Some("A kicker"),
    )

    val sublinkWithTooLongTitle = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      headline = longerThan54,
      kickerText = Some(longerThan54),
    )

    val withInvalidSupportingContent = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      trailText = Some("On a related article panel the trail text should become the panel description"),
      supportingContent = Seq(subLink, sublinkWithTooLongTitle),
    )

    val outcome = TrailsToShowcase.asSingleStoryPanel(withInvalidSupportingContent)

    outcome.left.toOption.nonEmpty should be(true)
    outcome.left.get.contains(s"The headline '$longerThan54' is longer than 54 characters") should be(true)
    outcome.left.get.contains(s"Kicker text '$longerThan54' is longer than 42 characters") should be(true)
  }

  "TrailToShowcase" should "reject related articles panels with incorrect number of articles" in {
    val subLink = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      headline = "This is fine",
      kickerText = Some("A kicker"),
    )

    val withoutEnoughSupportingContent = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      trailText = Some("On a related article panel the trail text should become the panel description"),
      supportingContent = Seq(subLink),
    )

    val outcome = TrailsToShowcase.asSingleStoryPanel(withoutEnoughSupportingContent)

    outcome.left.toOption.nonEmpty should be(true)
    outcome.left.get.contains("Could not find 2 valid related article trails") should be(true)
  }

  "TrailToShowcase" can "encode single story panel bullet lists from trailtext lines" in {
    val bulletEncodedTrailText =
      """
        | - Bullet 1
        | - Bullet 2
        | - Bullet 3
        |""".stripMargin

    val bulletedContent = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      trailText = Some(bulletEncodedTrailText),
    )

    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(bulletedContent).toOption.get

    val bulletList = singleStoryPanel.bulletList.get
    bulletList.listItems.size should be(3)
    bulletList.listItems.head.text should be("Bullet 1")
    bulletList.listItems.last.text should be("Bullet 3")
  }

  "TrailToShowcase" should "reject single story panel bullets which are too long" in {
    val bulletEncodedTrailText =
      """
        | - Bullet 1
        | - Bullet 2
        | - Bullet 3 is way way too long because the size limit for bullets is 118 characters and this is more than that so no surprise that it's dropped
        |""".stripMargin

    val bulletedContent = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      trailText = Some(bulletEncodedTrailText),
    )

    val outcome = TrailsToShowcase.asSingleStoryPanel(bulletedContent)

    val singleStoryPanel = outcome.toOption.get
    val bulletList = singleStoryPanel.bulletList.get
    val bulletListItems = bulletList.listItems
    bulletListItems.size should be(2)
    bulletListItems.head.text should be("Bullet 1")
    bulletListItems.last.text should be("Bullet 2")
  }

  "TrailToShowcase" should "omit the bullet list if no valid bullets are found" in {
    val bulletEncodedTrailText =
      """
        | - Bullet 1 is way way too long because the size limit for bullets is 118 characters and this is more than that so no surprise that it's dropped
        | - Bullet 2 is way way too long because the size limit for bullets is 118 characters and this is more than that so no surprise that it's dropped
        | - Bullet 3 is way way too long because the size limit for bullets is 118 characters and this is more than that so no surprise that it's dropped
        |""".stripMargin

    val bulletedContent = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      trailText = Some(bulletEncodedTrailText),
    )

    val outcome = TrailsToShowcase.asSingleStoryPanel(bulletedContent)

    outcome.right.toOption should be(None)
    outcome.left.get.contains("Trail text is not formatted as a bullet list") shouldBe (true)
  }

  "TrailToShowcase" should "reject bullet lists with less than 2 items" in {
    // Showcase specifies 2 or 3 items
    val bulletEncodedTrailText =
      """
          | - 1 bullet item is not going to be enough
          |""".stripMargin

    val bulletedContent = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      trailText = Some(bulletEncodedTrailText),
    )

    val outcome = TrailsToShowcase.asSingleStoryPanel(bulletedContent)

    outcome.right.toOption should be(None)
    outcome.left.get.contains("Need at least 2 valid bullet list items") shouldBe (true)
  }

  "TrailToShowcase" should "trim single story bullets to 3 at most" in {
    val bulletEncodedTrailText =
      """
        | - Bullet 1
        | - Bullet 2
        | - Bullet 3
        | - Bullet 4 should be dropped
        |""".stripMargin

    val bulletedContent = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      trailText = Some(bulletEncodedTrailText),
    )

    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(bulletedContent).toOption.get

    val bulletList = singleStoryPanel.bulletList.get
    val bulletListItems = bulletList.listItems
    bulletListItems.size should be(3)
    bulletListItems.last.text should be("Bullet 3")
  }

  "TrailToShowcase" should "omit single story panels with no bullets" in {
    val singleStoryTrails =
      Seq(
        makePressedContent(
          webPublicationDate = wayBackWhen,
          trailPicture = Some(imageMedia),
          trailText = Some("No valid bullets here"),
        ),
      )

    val rss = XML.loadString(TrailsToShowcase.fromTrails(Option("foo"), singleStoryTrails, Seq.empty, "")(request))

    val singleStoryPanels = (rss \ "channel" \ "item").filter(ofSingleStoryPanelType)
    singleStoryPanels.size should be(0)
  }

  "TrailToShowcase" can "single story panels should prefer replaced images over content trail image" in {
    val curatedContent = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      replacedImage = Some(replacedImage),
      headline = "My unique headline",
      byline = Some("Trail byline"),
      kickerText = Some("A Kicker"),
      trailText = Some(twoEncodedBulletItems),
    )

    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(curatedContent).toOption.get

    singleStoryPanel.imageUrl should be("http://localhost/replaced-image.jpg")
  }

  "TrailToShowcase" can "should default single panel last updated to content web publication date if no content last updated value is available" in {
    val curatedContent = makePressedContent(
      webPublicationDate = wayBackWhen,
      trailPicture = Some(imageMedia),
      trailText = Some(twoEncodedBulletItems),
    )

    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(curatedContent).toOption.get

    singleStoryPanel.updated should be(wayBackWhen)
  }

  "TrailToShowcase" can "should consider collection last updated when deciding panel updated time" in {
    val unchangingContent = makePressedContent(
      webPublicationDate = wayBackWhen,
      trailPicture = Some(imageMedia),
      trailText = Some(twoEncodedBulletItems),
      headline = "Panel title | Headline",
      kickerText = Some("A kicker"),
    )
    val collectionLastUpdated = DateTime.now

    val recentlyEditedRundownPanelMadeWithUnchangingContent = TrailsToShowcase
      .asRundownPanel(
        Seq(unchangingContent, unchangingContent, unchangingContent),
        "rundown-container-id",
        Some(collectionLastUpdated),
      )
      .right
      .get

    recentlyEditedRundownPanelMadeWithUnchangingContent.updated should be(collectionLastUpdated)
  }

  "TrailToShowcase" can "create Rundown panels from a group of trails" in {
    val trail = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      kickerText = Some("A Kicker"),
      trailPicture = Some(imageMedia),
      headline = "My panel title | My headline",
    )
    val anotherTrail =
      makePressedContent(
        webPublicationDate = wayBackWhen,
        lastModified = Some(lastModifiedWayBackWhen),
        trailPicture = Some(imageMedia),
        kickerText = Some("Another Kicker"),
      )

    val rundownPanel = TrailsToShowcase
      .asRundownPanel(Seq(trail, anotherTrail, anotherTrail), "rundown-container-id")
      .right
      .get

    rundownPanel.`type` should be("RUNDOWN")
    // Guid for rundown item is the container id and the hash of the title
    rundownPanel.guid should be("rundown-container-id--180248192")
    rundownPanel.panelTitle should be("My panel title")

    rundownPanel.articleGroup.role shouldBe ("RUNDOWN")
    val articleGroupArticles = rundownPanel.articleGroup.articles
    articleGroupArticles.size should be(3)

    val firstItemInArticleGroup = articleGroupArticles.head
    firstItemInArticleGroup.title should be("My headline")
    firstItemInArticleGroup.link should be(
      "https://www.theguardian.com/sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report",
    )
    firstItemInArticleGroup.guid should be(
      "https://www.theguardian.com/sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report",
    )
    firstItemInArticleGroup.published should be(wayBackWhen)
    firstItemInArticleGroup.updated should be(lastModifiedWayBackWhen)
    firstItemInArticleGroup.overline should be(Some("A Kicker"))
    firstItemInArticleGroup.imageUrl should be(Some("http://localhost/trail.jpg"))
  }

  "TrailToShowcase" can "marshall Rundown Story panels to Rome RSS entries" in {
    // Asserting the specifics of how we set up the Rome entries for a single story panel
    val trail = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      kickerText = Some("A Kicker"),
      trailPicture = Some(imageMedia),
      headline = "Rundown panel title | My headline",
    )
    val anotherTrail =
      makePressedContent(
        webPublicationDate = wayBackWhen,
        lastModified = Some(lastModifiedWayBackWhen),
        trailPicture = Some(imageMedia),
        kickerText = Some("Another Kicker"),
      )
    val rundownPanel = TrailsToShowcase
      .asRundownPanel(Seq(trail, anotherTrail, anotherTrail), "rundown-container-id")
      .right
      .get

    val entry = TrailsToShowcase.asSyndEntry(rundownPanel)

    entry.getPublishedDate should be(wayBackWhen.toDate)
    val rssAtomModule = entry.getModule(RssAtomModule.URI).asInstanceOf[RssAtomModule]
    rssAtomModule.getUpdated should be(Some(lastModifiedWayBackWhen))

    // Rundown panels have no image of their own
    val mediaModule = entry.getModule("http://search.yahoo.com/mrss/").asInstanceOf[MediaEntryModule]
    mediaModule should be(null)
    val gModule = entry.getModule(GModule.URI).asInstanceOf[GModule]
    val gPanel = gModule.getPanel
    gPanel shouldNot be(None)
    gPanel.get.`type` should be("RUNDOWN")
    gPanel.get.content should be("Rundown panel title")

    gModule.getPanelTitle should be(Some("Rundown panel title"))

    val articleGroup = gModule.getArticleGroup.get
    articleGroup.role should be("RUNDOWN")
    articleGroup.articles.size should be(3)

    val article = articleGroup.articles.head
    article.title should be("My headline")
    article.published should be(wayBackWhen)
    article.updated should be(lastModifiedWayBackWhen)
  }

  "TrailToShowcase" should "strip all markup from rundown text elements" in {
    val firstTrail = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      kickerText = Some("<b>A Kicker</b>"),
      trailPicture = Some(imageMedia),
      headline = " <strong>My rundown panel title</strong>|My <i>headline</i>",
    )
    val anotherTrail =
      makePressedContent(
        webPublicationDate = wayBackWhen,
        lastModified = Some(lastModifiedWayBackWhen),
        trailPicture = Some(imageMedia),
        kickerText = Some("Another Kicker"),
      )

    val outcome = TrailsToShowcase
      .asRundownPanel(Seq(firstTrail, anotherTrail, anotherTrail), "rundown-container-id")

    outcome.right.get.panelTitle should be("My rundown panel title")
    outcome.right.get.articleGroup.articles.head.title should be("My headline")
    outcome.right.get.articleGroup.articles.head.overline should be(Some("A Kicker"))
  }

  "TrailToShowcase" should "infer the mandatory Rundown panel title from a pipe delimit in the first trail's headline" in {
    val firstTrail = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      kickerText = Some("A Kicker"),
      trailPicture = Some(imageMedia),
      headline = " My rundown panel title|My headline",
    )
    val anotherTrail =
      makePressedContent(
        webPublicationDate = wayBackWhen,
        lastModified = Some(lastModifiedWayBackWhen),
        trailPicture = Some(imageMedia),
        kickerText = Some("Another Kicker"),
      )

    val outcome = TrailsToShowcase
      .asRundownPanel(Seq(firstTrail, anotherTrail, anotherTrail), "rundown-container-id")

    outcome.right.get.panelTitle should be("My rundown panel title")
    outcome.right.get.articleGroup.articles.head.title should be("My headline")
  }

  "TrailToShowcase" should "allow panel titles with pipes in them" in {
    val firstTrail = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      kickerText = Some("A Kicker"),
      trailPicture = Some(imageMedia),
      headline =
        "Evening briefing | Tuesday 28 September | PM meets with Liberal MPs worried Coalition will appease Nats ",
    )
    val anotherTrail =
      makePressedContent(
        webPublicationDate = wayBackWhen,
        lastModified = Some(lastModifiedWayBackWhen),
        trailPicture = Some(imageMedia),
        kickerText = Some("Another Kicker"),
      )

    val outcome = TrailsToShowcase
      .asRundownPanel(Seq(firstTrail, anotherTrail, anotherTrail), "rundown-container-id")

    outcome.right.get.panelTitle should be("Evening briefing | Tuesday 28 September")
    outcome.right.get.articleGroup.articles.head.title should be(
      "PM meets with Liberal MPs worried Coalition will appease Nats",
    )
  }

  "TrailToShowcase" should "reject rundown panels with missing panel title" in {
    val firstTrail = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      kickerText = Some("A Kicker"),
      trailPicture = Some(imageMedia),
      headline = "My headline but I've forgotten the rundown panel title",
    )
    val anotherTrail =
      makePressedContent(
        webPublicationDate = wayBackWhen,
        lastModified = Some(lastModifiedWayBackWhen),
        trailPicture = Some(imageMedia),
        kickerText = Some("Another Kicker"),
      )

    val outcome = TrailsToShowcase
      .asRundownPanel(Seq(firstTrail, anotherTrail, anotherTrail), "rundown-container-id")

    outcome.right.toOption should be(None)
    outcome.left.get.contains(
      "Could not find a panel title in the first trail headline 'My headline but I've forgotten the rundown panel title'",
    ) should be(true)
  }

  "TrailToShowcase" can "create Rundown panel articles with authors" in {
    val withByline = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      byline = Some("An author"),
      trailPicture = Some(imageMedia),
      headline = "My rundown panel title | My headline",
    )

    val rundownPanel = TrailsToShowcase
      .asRundownPanel(Seq(withByline, withByline, withByline), "rundown-container-id")
      .right
      .get

    val firstItemInArticleGroup = rundownPanel.articleGroup.articles.head
    firstItemInArticleGroup.author should be(Some("An author"))
  }

  "TrailToShowcase" can "create Rundown panel articles with kickers" in {
    val withKicker = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      kickerText = Some("A kicker"),
      trailPicture = Some(imageMedia),
      headline = "My rundown panel title | My headline",
    )

    val rundownPanel = TrailsToShowcase
      .asRundownPanel(Seq(withKicker, withKicker, withKicker), "rundown-container-id")
      .right
      .get

    val firstItemInArticleGroup = rundownPanel.articleGroup.articles.head
    firstItemInArticleGroup.overline should be(Some("A kicker"))
  }

  "TrailToShowcase" should " prefer kickers over authors if both are supplied for all rundown articles" in {
    val withAuthorAndKicker = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      kickerText = Some("A kicker"),
      byline = Some("A byline"),
      trailPicture = Some(imageMedia),
      headline = "My rundown panel title | My headline",
    )

    val rundownPanel = TrailsToShowcase
      .asRundownPanel(Seq(withAuthorAndKicker, withAuthorAndKicker, withAuthorAndKicker), "rundown-container-id")
      .right
      .get

    val firstItemInArticleGroup = rundownPanel.articleGroup.articles.head
    firstItemInArticleGroup.overline should be(Some("A kicker"))
    firstItemInArticleGroup.author should be(None)
  }

  "TrailToShowcase" should "fall back to authors of some rundown articles are miss kickers" in {
    val withAuthorAndKicker = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      kickerText = Some("A kicker"),
      byline = Some("A byline"),
      trailPicture = Some(imageMedia),
      headline = "My rundown panel title | My headline",
    )

    val withMissingKicker = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      byline = Some("A byline"),
      trailPicture = Some(imageMedia),
    )

    val rundownPanel = TrailsToShowcase
      .asRundownPanel(Seq(withAuthorAndKicker, withAuthorAndKicker, withMissingKicker), "rundown-container-id")
      .right
      .get

    rundownPanel.articleGroup.articles.forall(_.author.nonEmpty) should be(true)
    rundownPanel.articleGroup.articles.forall(_.overline.isEmpty) should be(true)
  }

  "TrailToShowcase" should "reject rundown panels if the articles do not have a complete set of authors of kickers" in {
    val withKicker = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      kickerText = Some("A kicker"),
      trailPicture = Some(imageMedia),
      headline = "My rundown panel title | My unique headline",
    )

    val withAuthor = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      byline = Some("A byline"),
      trailPicture = Some(imageMedia),
    )

    val rundownPanel = TrailsToShowcase
      .asRundownPanel(Seq(withKicker, withKicker, withAuthor), "rundown-container-id")

    rundownPanel.right.toOption should be(None)
    rundownPanel.left.get should be(Seq("Rundown trails need to have all Kickers or all Bylines"))
  }

  "TrailToShowcase" can "rundown panels articles should prefer replaced images over content trail image" in {
    val withReplacedImage = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      replacedImage = Some(replacedImage),
      kickerText = Some("Kicker"),
      headline = "My rundown panel title | My unique headline",
    )

    val rundownPanel = TrailsToShowcase
      .asRundownPanel(Seq(withReplacedImage, withReplacedImage, withReplacedImage), "rundown-id")
      .right
      .get

    rundownPanel.articleGroup.articles.head.imageUrl shouldBe Some("http://localhost/replaced-image.jpg")
  }

  "TrailToShowcase" can "should default rundown articles updated to content publication date if no last updated value is available" in {
    val content = makePressedContent(
      webPublicationDate = wayBackWhen,
      trailPicture = Some(imageMedia),
      kickerText = Some("Kicker"),
      headline = "My rundown panel title | My headline",
    )

    val rundownPanel = TrailsToShowcase
      .asRundownPanel(Seq(content, content, content), "rundown-container-id")
      .right
      .get

    rundownPanel.articleGroup.articles.head.updated shouldBe (wayBackWhen)
  }

  "TrailToShowcase validation" should "infer single story panel title from pipe delimited headline" in {
    val content = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      trailText = Some(twoEncodedBulletItems),
      headline = "Meteoric rise | US Open winner could become Britain’s first billion-dollar sport star",
    )

    val outcome = TrailsToShowcase.asSingleStoryPanel(content)

    outcome.right.get.title should be("US Open winner could become Britain’s first billion-dollar sport star")
    outcome.right.get.panelTitle should be(Some("Meteoric rise"))
  }

  "TrailToShowcase validation" should "reject single panel g:overlines longer than 30 characters" in {
    val longerThan30 = "This sentence is way longer than 30 characters and should be omitted"
    longerThan30.size > 30 should be(true)

    val content = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      kickerText = Some(longerThan30),
      trailText = Some("- A bullet"),
    )

    val outcome = TrailsToShowcase.asSingleStoryPanel(content)

    outcome.right.toOption should be(None)
    outcome.left.get.contains(s"Kicker text '${longerThan30}' is longer than 30 characters") shouldBe (true)
  }

  "TrailToShowcase validation" should "reject single panels with titles longer than 86 characters" in {
    val longerThan30 = "This sentence is way longer than 30 characters and should be omitted"
    val longerThan86 = longerThan30 + longerThan30 + longerThan30
    longerThan86.size > 86 should be(true)

    val withLongTitle = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      headline = longerThan86,
    )

    val outcome = TrailsToShowcase.asSingleStoryPanel(withLongTitle)

    outcome.right.toOption should be(None)
    outcome.left.get.contains(s"The headline '$longerThan86' is longer than 86 characters") shouldBe (true)
  }

  "TrailToShowcase validation" should "omit single panel author fields longer than 42 characters" in {
    val longerThan42 = "This byline is way longer than 40 characters and should obviously be omitted"
    longerThan42.size > 42 should be(true)

    val withLongByline = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      byline = Some(longerThan42),
      trailText = Some(twoEncodedBulletItems),
    )

    val outcome = TrailsToShowcase.asSingleStoryPanel(withLongByline)

    outcome.right.get.author should be(None)
    //outcome.left.get.contains("Author was too long and was dropped") shouldBe(true)
  }

  "TrailToShowcase validation" should "reject single panels with no image" in {
    val withNoImage = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
    )

    val outcome = TrailsToShowcase.asSingleStoryPanel(withNoImage)

    outcome.right.toOption should be(None)
    outcome.left.get.contains("No image available") shouldBe (true)
  }

  "TrailToShowcase validation" should "reject single panels with images smaller than 640x320" in {
    val withTooSmallImage = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(smallImageMedia),
    )

    val outcome = TrailsToShowcase.asSingleStoryPanel(withTooSmallImage)

    outcome.right.toOption should be(None)
    outcome.left.get.contains("Could not find image bigger than the minimum required size: 640x320") shouldBe (true)
  }

  "TrailToShowcase validation" should "reject rundown panels with less than 3 valid articles" in {
    val valid = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      kickerText = Some("A kicker"),
      headline = "My rundown panel title | My unique headline",
    )
    val notValid = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      kickerText = Some("A kicker"),
      headline =
        "Way to long Way to long Way to long Way to long Way to long Way to long Way to long Way to longWay to long Way to long",
    )

    val rundownPanel =
      TrailsToShowcase.asRundownPanel(Seq(valid, valid, notValid), "rundown-container-id")

    rundownPanel.right.toOption should be(None)
    rundownPanel.left.get.head should be("Could not find 3 valid rundown trails")
  }

  "TrailToShowcase validation" should "trim rundown panels to 3 articles if too many are supplied" in {
    val content = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      kickerText = Some("Kicker"),
      headline = "My rundown panel title | My unique headline",
    )

    val rundownPanel = TrailsToShowcase
      .asRundownPanel(Seq(content, content, content, content), "rundown-container-id")
      .right
      .get

    rundownPanel.articleGroup.articles.size should be(3)
  }

  "TrailToShowcase validation" should "reject rundown panels with g:panel_titles longer than 74 characters" in {
    val longerThan74 =
      "The container name is really really long is Showcase aer well within their rights to reject this"
    longerThan74.length > 74 should be(true)

    val trail = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      headline = s"$longerThan74 | My unique headline",
    )
    val anotherTrail =
      makePressedContent(webPublicationDate = wayBackWhen, lastModified = Some(lastModifiedWayBackWhen))

    val rundownPanel = TrailsToShowcase.asRundownPanel(Seq(trail, anotherTrail), "rundown-container-id")

    rundownPanel.toOption shouldBe (None)
    rundownPanel.left.get.contains(s"The panel title '$longerThan74' is longer than 74 characters") shouldBe (true)
  }

  "TrailToShowcase validation" should "reject rundown panel article kickers longer than 30 characters" in {
    val longerThan30 = "This kicker is way longer than 30 characters and should be omitted"
    longerThan30.length > 30 should be(true)

    val withTooLongKicker = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      kickerText = Some(longerThan30),
    )

    val outcome = TrailsToShowcase
      .asRundownPanel(Seq(withTooLongKicker, withTooLongKicker, withTooLongKicker), "rundown-container-id")

    outcome.toOption should be(None)
    outcome.left.get.contains(s"Kicker text '${longerThan30}' is longer than 30 characters") should be(true)
  }

  "TrailToShowcase validation" should "reject rundown panel articles with titles longer than 64 characters" in {
    val longerThan30 = "This sentence is way longer than 30 characters and should be omitted"
    val longerThan64 = longerThan30 + longerThan30 + "blah blah"
    longerThan64.length > 64 should be(true)

    val withTooLongHeadline = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      headline = longerThan64,
    )

    val rundownPanel = TrailsToShowcase.asRundownPanel(
      Seq(withTooLongHeadline, withTooLongHeadline, withTooLongHeadline),
      "rundown-container-id",
    )

    rundownPanel.toOption should be(None)
    rundownPanel.left.get.contains(s"The headline '$longerThan64' is longer than 64 characters") should be(true)
  }

  "TrailToShowcase validation" should "reject rundown articles with images smaller than 1200x900" in {
    val withTooSmallImage = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(mediumImageMedia),
    )

    val rundownPanel = TrailsToShowcase
      .asRundownPanel(Seq(withTooSmallImage, withTooSmallImage, withTooSmallImage), "rundown-container-id")

    rundownPanel.toOption should be(None)
    rundownPanel.left.get.contains("Could not find image bigger than the minimum required size: 1200x900") should be(
      true,
    )
  }

  "TrailToShowcase validation" should "omit kickers from rundown panels if kicker is not set on all articles" in {
    val withKicker = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      kickerText = Some("Kicker"),
      byline = Some("A byline"),
      headline = "My rundown panel title | My unique headline",
    )
    val withoutKicker = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      byline = Some("A byline"),
    )

    val rundownPanel = TrailsToShowcase
      .asRundownPanel(Seq(withKicker, withKicker, withoutKicker), "rundown-container-id")
      .right
      .get

    rundownPanel.articleGroup.articles.size should be(3)
    rundownPanel.articleGroup.articles.forall(_.overline.isEmpty) should be(true)
  }

  "TrailToShowcase validation" should "reject rundown panel articles if author been set on some but not all articles" in {
    val withAuthor = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      headline = "Panel title | headline",
      byline = Some("An author"),
    )
    val withoutAuthor = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
    )

    val outcome = TrailsToShowcase
      .asRundownPanel(Seq(withAuthor, withAuthor, withoutAuthor), "rundown-container-id")

    outcome.right.toOption should be(None)
    outcome.left.get.contains("Rundown trails need to have all Kickers or all Bylines") should be(true)
  }

  "TrailToShowcase validation" should "choose kickers over authors" in {
    val withAuthorAndKicker = makePressedContent(
      webPublicationDate = wayBackWhen,
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      byline = Some("An author"),
      kickerText = Some("A kicker"),
      headline = "My rundown panel title | My unique headline",
    )

    val rundownPanel = TrailsToShowcase
      .asRundownPanel(Seq(withAuthorAndKicker, withAuthorAndKicker, withAuthorAndKicker), "rundown-container-id")
      .right
      .get

    rundownPanel.articleGroup.articles.size should be(3)
    rundownPanel.articleGroup.articles.forall(_.overline.nonEmpty) should be(true)
    rundownPanel.articleGroup.articles.forall(_.author.isEmpty) should be(true)
  }

  private def ofSingleStoryPanelType(node: Node) = {
    (node \ "panel")
      .filter(_.prefix == "g")
      .filter { node =>
        node.attribute("type").map(_.text) == Some("SINGLE_STORY")
      }
      .nonEmpty
  }

  private def ofRundownPanelType(node: Node) = {
    (node \ "panel")
      .filter(_.prefix == "g")
      .filter { node =>
        node.attribute("type").map(_.text) == Some("RUNDOWN")
      }
      .nonEmpty
  }

  private def makePressedContent(
      webPublicationDate: DateTime = DateTime.now,
      lastModified: Option[DateTime] = None,
      trailPicture: Option[ImageMedia] = None,
      replacedImage: Option[Image] = None,
      headline: String = "A headline",
      byline: Option[String] = None,
      kickerText: Option[String] = None,
      trailText: Option[String] = Some("Some trail text"),
      supportingContent: Seq[PressedContent] = Seq.empty,
  ) = {
    val url = "/sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report"
    val webUrl =
      "https://www.theguardian.com/sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report"
    val title = "A title"

    // Create a maybe content with trail to present or trail image
    // This seems to be the most promising media element for a Card.
    val apiContent = ApiContent(
      id = "an-id",
      `type` = com.gu.contentapi.client.model.v1.ContentType.Article,
      sectionId = None,
      sectionName = None,
      webPublicationDate = Some(jodaToJavaInstant(webPublicationDate).atOffset(ZoneOffset.UTC).toCapiDateTime),
      webTitle = title,
      webUrl = webUrl,
      apiUrl = "",
      fields = None,
    )
    val trail = PressedTrail(
      trailPicture = trailPicture,
      byline = None,
      thumbnailPath = None,
      webPublicationDate = webPublicationDate,
    )
    val mayBeContent = Some(PressedStory.apply(apiContent).copy(trail = trail))

    val properties = PressedProperties(
      isBreaking = false,
      showByline = false,
      showKickerTag = false,
      imageSlideshowReplace = false,
      maybeContent = mayBeContent,
      maybeContentId = None,
      isLiveBlog = false,
      isCrossword = false,
      byline = byline,
      image = replacedImage,
      webTitle = title,
      linkText = None,
      embedType = None,
      embedCss = None,
      embedUri = None,
      maybeFrontPublicationDate = None,
      href = None,
      webUrl = Some("an-article"),
      editionBrandings = None,
      atomId = None,
      showMainVideo = false,
    )

    val kicker = kickerText.map { k =>
      FreeHtmlKicker(KickerProperties(kickerText = Some(k)), "Kicker body")
    }

    val header = PressedCardHeader(
      isVideo = false,
      isComment = false,
      isGallery = false,
      isAudio = false,
      kicker = kicker,
      seriesOrBlogKicker = None,
      headline = headline,
      url = url,
      hasMainVideoElement = None,
    )

    val card = PressedCard(
      id = "sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report",
      cardStyle = CardStyle.make(Editorial),
      webPublicationDateOption = Some(webPublicationDate),
      lastModifiedOption = lastModified,
      trailText = trailText,
      mediaType = None,
      starRating = None,
      shortUrl = "",
      shortUrlPath = None,
      isLive = true,
      group = "",
    )

    val discussionSettings = PressedDiscussionSettings(
      isCommentable = false,
      isClosedForComments = true,
      discussionId = None,
    )

    val displaySettings = PressedDisplaySettings(
      isBoosted = false,
      showBoostedHeadline = false,
      showQuotedHeadline = false,
      showLivePlayable = false,
      imageHide = false,
    )

    CuratedContent(
      properties = properties,
      header = header,
      card = card,
      discussion = discussionSettings,
      display = displaySettings,
      format = None,
      enriched = None,
      supportingContent = supportingContent.toList,
      cardStyle = CardStyle.make(Editorial),
    )
  }

}
