package common

import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import com.gu.contentapi.client.model.v1.ContentFields
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime
import com.gu.facia.api.utils.Editorial
import com.sun.syndication.feed.module.mediarss.MediaEntryModule
import implicits.Dates.jodaToJavaInstant
import model.pressed._
import model.{ImageAsset, ImageMedia}
import org.joda.time.DateTime
import org.scalatest.{FlatSpec, Matchers}
import play.api.test.FakeRequest

import java.time.ZoneOffset
import scala.xml.{Node, NodeSeq, XML}

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

  "TrailsToShowcase" should "set module namespaces in feed header" in {
    val singleStoryTrails =
      Seq(
        makePressedContent(
          webPublicationDate = Some(wayBackWhen),
          trailPicture = Some(imageMedia),
          trailText = Some("- A bullet"),
        ),
      )

    val rss = XML.loadString(
      TrailsToShowcase(Option("foo"), singleStoryTrails, Seq.empty, "Rundown panel name", "rundown-panel-id")(request),
    )

    rss.getNamespace("g") should be("http://schemas.google.com/pcn/2020")
    rss.getNamespace("media") should be("http://search.yahoo.com/mrss/")
  }

  "TrailsToShowcase" should "propogate media module usage up from rundown panel articles" in {
    val content = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      trailPicture = Some(imageMedia),
      kickerText = Some("Kicker"),
    )

    val rss = XML.loadString(
      TrailsToShowcase(
        Option("foo"),
        Seq.empty,
        Seq(content, content, content),
        "Rundown panel name",
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
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      byline = Some("Trail byline"),
      kickerText = Some("Kicker"),
      trailText = Some(bulletEncodedTrailText),
    )
    val rundownArticleContent = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      byline = Some("Trail byline"),
    )
    val singleStoryTrails = Seq(singleStoryContent)
    val rundownTrails = Seq(rundownArticleContent, rundownArticleContent, rundownArticleContent)

    val rss = XML.loadString(
      TrailsToShowcase(
        Option("foo"),
        singleStoryTrails,
        rundownTrails,
        "Rundown container title",
        "rundown-container-id",
      )(request),
    )

    val channelItems = rss \ "channel" \ "item"
    val singleStoryPanels = channelItems.filter(ofSingleStoryPanelType)
    singleStoryTrails.size should be(1)

    val rundownPanels = channelItems.filter(ofRundownPanelType)
    rundownPanels.size should be(1)

    val singleStoryPanel = singleStoryPanels.head
    (singleStoryPanel \ "title").text should be("A headline")
    (singleStoryPanel \ "guid").text should be(
      "https://www.theguardian.com/sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report",
    )
    (singleStoryPanel \ "link").text should be(
      "https://www.theguardian.com/sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report",
    )
    (singleStoryPanel \ "creator").filter(_.prefix == "dc").head.text should be(
      "Trail byline",
    ) // TODO should be <author> in Google Showcase docs
    // Single story panels are allowed to have author and kicker at the same time
    (singleStoryPanel \ "overline").filter(_.prefix == "g").head.text should be(
      "Kicker",
    )

    (singleStoryPanel \ "published").filter(_.prefix == "atom").text should be("2021-03-02T12:30:01Z")
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

    val rundownPanel = rundownPanels.head
    val rundownPanelGuid = (rundownPanel \ "guid").head
    rundownPanelGuid.text should be("rundown-container-id")
    rundownPanelGuid.attribute("isPermaLink").get.head.text should be("false")

    (rundownPanel \ "panel_title").filter(_.prefix == "g").head.text should be("Rundown container title")

    (rundownPanel \ "published").filter(_.prefix == "atom").text should be("2021-03-02T12:30:01Z")
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
    (rundownArticle \ "title").text should be("A headline")
    (rundownArticle \ "link").text should be(
      "https://www.theguardian.com/sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report",
    )
    (rundownArticle \ "published").filter(_.prefix == "atom").text should be("2021-03-02T12:30:01Z")
    (rundownArticle \ "updated").filter(_.prefix == "atom").text should be("2021-03-02T13:30:01Z")
    (rundownArticle \ "content").filter(_.prefix == "media").head.attribute("url").get.head.text should be(
      "http://localhost/trail.jpg",
    )
  }

  "TrailToShowcase" should "omit rundown panel if there are no rundown trials" in {
    val singleStoryTrails =
      Seq(makePressedContent(webPublicationDate = Some(wayBackWhen), trailPicture = Some(imageMedia)))

    val rss = XML.loadString(TrailsToShowcase(Option("foo"), singleStoryTrails, Seq.empty, "", "")(request))

    val rundownPanels = (rss \ "channel" \ "item").filter(ofRundownPanelType)
    rundownPanels.size should be(0)
  }

  "TrailToShowcase" can "create Single Story panels from single trails" in {
    val curatedContent = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      headline = "My unique headline",
      byline = Some("Trail byline"),
      kickerText = Some("A Kicker"),
      trailText = Some("- A bullet"),
    )

    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(curatedContent).get

    singleStoryPanel.getTitle should be("My unique headline")
    singleStoryPanel.getAuthor should be("Trail byline")
    singleStoryPanel.getLink should be(
      "https://www.theguardian.com/sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report",
    )

    val gModule = singleStoryPanel.getModule(GModule.URI).asInstanceOf[GModule]
    gModule.getPanel should be(Some("SINGLE_STORY"))
    gModule.getPanelTitle should be(None) // Specifically omitted
    gModule.getOverline should be(Some("A Kicker"))

    val rssAtomModule = singleStoryPanel.getModule(RssAtomModule.URI).asInstanceOf[RssAtomModule]
    rssAtomModule.getPublished should be(Some(wayBackWhen))
    rssAtomModule.getUpdated should be(Some(lastModifiedWayBackWhen))

    // Single panel stories require a media element which we take from the mayBeContent trail
    val mediaModule = singleStoryPanel.getModule("http://search.yahoo.com/mrss/").asInstanceOf[MediaEntryModule]
    mediaModule.getMediaContents.size should be(1)
    mediaModule.getMediaContents.head.getReference() should be(
      new com.sun.syndication.feed.module.mediarss.types.UrlReference("http://localhost/trail.jpg"),
    )
  }

  "TrailToShowcase" can "encode single panel bullet lists from trailtext lines" in {
    val bulletEncodedTrailText =
      """
        | - Bullet 1
        | - Bullet 2
        | - Bullet 3
        |""".stripMargin

    val bulletedContent = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      trailText = Some(bulletEncodedTrailText),
    )

    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(bulletedContent).get

    val gModule = singleStoryPanel.getModule(GModule.URI).asInstanceOf[GModule]
    gModule.getBulletList.nonEmpty should be(true)
    val bulletList: BulletList = gModule.getBulletList.get
    val bulletListItems = bulletList.listItems
    bulletListItems.size should be(3)
    bulletListItems.head.text should be("Bullet 1")
    bulletListItems.last.text should be("Bullet 3")
  }

  "TrailToShowcase" should "reject single story panel bullets which are too long" in {
    val bulletEncodedTrailText =
      """
        | - Bullet 1
        | - Bullet 2
        | - Bullet 3 is way way too long because the size limit for bullets is 118 characters and this is more than that so no surprise that it's dropped
        |""".stripMargin

    val bulletedContent = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      trailText = Some(bulletEncodedTrailText),
    )

    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(bulletedContent).get

    val gModule = singleStoryPanel.getModule(GModule.URI).asInstanceOf[GModule]
    gModule.getBulletList.nonEmpty should be(true)
    val bulletList: BulletList = gModule.getBulletList.get
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
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      trailText = Some(bulletEncodedTrailText),
    )

    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(bulletedContent)

    singleStoryPanel should be(None)
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
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      trailText = Some(bulletEncodedTrailText),
    )

    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(bulletedContent).get

    val gModule = singleStoryPanel.getModule(GModule.URI).asInstanceOf[GModule]
    gModule.getBulletList.nonEmpty should be(true)
    val bulletList: BulletList = gModule.getBulletList.get
    val bulletListItems = bulletList.listItems
    bulletListItems.size should be(3)
    bulletListItems.last.text should be("Bullet 3")
  }

  "TrailToShowcase" should "omit single story panels with no bullets" in {
    val singleStoryTrails =
      Seq(
        makePressedContent(
          webPublicationDate = Some(wayBackWhen),
          trailPicture = Some(imageMedia),
          trailText = Some("No valid bullets here"),
        ),
      )

    val rss = XML.loadString(TrailsToShowcase(Option("foo"), singleStoryTrails, Seq.empty, "", "")(request))

    val singleStoryPanels = (rss \ "channel" \ "item").filter(ofSingleStoryPanelType)
    singleStoryPanels.size should be(0)
  }

  "TrailToShowcase" can "single story panels should prefer replaced images over content trail image" in {
    val curatedContent = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      replacedImage = Some(replacedImage),
      headline = "My unique headline",
      byline = Some("Trail byline"),
      kickerText = Some("A Kicker"),
      trailText = Some("- A bullet"),
    )

    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(curatedContent).get

    val mediaModule = singleStoryPanel.getModule("http://search.yahoo.com/mrss/").asInstanceOf[MediaEntryModule]
    mediaModule.getMediaContents.size should be(1)
    mediaModule.getMediaContents.head.getReference() should be(
      new com.sun.syndication.feed.module.mediarss.types.UrlReference("http://localhost/replaced-image.jpg"),
    )
  }

  "TrailToShowcase" can "should default single panel last updated to web publication date if no last updated value is available" in {
    val curatedContent = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      trailPicture = Some(imageMedia),
      trailText = Some("- A bullet"),
    )

    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(curatedContent).get

    val rssAtomModule = singleStoryPanel.getModule(RssAtomModule.URI).asInstanceOf[RssAtomModule]
    rssAtomModule.getUpdated should be(Some(wayBackWhen))
  }

  "TrailToShowcase" can "create Rundown panels from a group of trials" in {
    val trail = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      kickerText = Some("A Kicker"),
      trailPicture = Some(imageMedia),
    )
    val anotherTrail =
      makePressedContent(
        webPublicationDate = Some(wayBackWhen),
        lastModified = Some(lastModifiedWayBackWhen),
        trailPicture = Some(imageMedia),
        kickerText = Some("Another Kicker"),
      )

    val rundownPanel = TrailsToShowcase
      .asRundownPanel("Rundown container name", Seq(trail, anotherTrail, anotherTrail), "rundown-container-id")
      .get

    rundownPanel.getLink should be(null) // TODO
    rundownPanel.getUri should be("rundown-container-id") // Guid for rundown item is the container id.

    // Rundown panels have no image of their own
    val mediaModule = rundownPanel.getModule("http://search.yahoo.com/mrss/").asInstanceOf[MediaEntryModule]
    mediaModule should be(null)

    val gModule = rundownPanel.getModule(GModule.URI).asInstanceOf[GModule]
    gModule.getPanel should be(Some("RUNDOWN"))
    gModule.getPanelTitle should be(Some("Rundown container name"))

    val articleGroup = gModule.getArticleGroup.get
    articleGroup.role should be(Some("RUNDOWN"))
    articleGroup.articles.size should be(3)

    val firstItemInArticleGroup = articleGroup.articles.head
    firstItemInArticleGroup.title should be("A headline")
    firstItemInArticleGroup.link should be(
      "https://www.theguardian.com/sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report",
    )
    firstItemInArticleGroup.guid should be(
      "https://www.theguardian.com/sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report",
    )
    firstItemInArticleGroup.published should be(wayBackWhen)
    firstItemInArticleGroup.updated should be(lastModifiedWayBackWhen)
    firstItemInArticleGroup.overline should be(Some("A Kicker"))
    firstItemInArticleGroup.mediaContent.get.getReference.toString should be("http://localhost/trail.jpg")

    // Rundown panel stories require a media element
    val rundownPanelMediaModule = rundownPanel.getModule("http://search.yahoo.com/mrss/").asInstanceOf[MediaEntryModule]
  }

  "TrailToShowcase" can "create Rundown panel articles with authors" in {
    val withByline = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      byline = Some("An author"),
      trailPicture = Some(imageMedia),
    )

    val rundownPanel = TrailsToShowcase
      .asRundownPanel("Rundown container name", Seq(withByline, withByline, withByline), "rundown-container-id")
      .get

    val gModule = rundownPanel.getModule(GModule.URI).asInstanceOf[GModule]
    val articleGroup = gModule.getArticleGroup.get
    val firstItemInArticleGroup = articleGroup.articles.head
    firstItemInArticleGroup.author should be(Some("An author"))
  }

  "TrailToShowcase" can "create Rundown panel articles with kickers" in {
    val withKicker = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      kickerText = Some("A kicker"),
      trailPicture = Some(imageMedia),
    )

    val rundownPanel = TrailsToShowcase
      .asRundownPanel("Rundown container name", Seq(withKicker, withKicker, withKicker), "rundown-container-id")
      .get

    val gModule = rundownPanel.getModule(GModule.URI).asInstanceOf[GModule]
    val articleGroup = gModule.getArticleGroup.get
    val firstItemInArticleGroup = articleGroup.articles.head
    firstItemInArticleGroup.overline should be(Some("A kicker"))
  }

  "TrailToShowcase" should " prefer kickers over authors if both are supplied for all rundown articles" in {
    val withAuthorAndKicker = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      kickerText = Some("A kicker"),
      byline = Some("A byline"),
      trailPicture = Some(imageMedia),
    )

    val rundownPanel = TrailsToShowcase
      .asRundownPanel(
        "Rundown container name",
        Seq(withAuthorAndKicker, withAuthorAndKicker, withAuthorAndKicker),
        "rundown-container-id",
      )
      .get

    val gModule = rundownPanel.getModule(GModule.URI).asInstanceOf[GModule]
    val articleGroup = gModule.getArticleGroup.get
    val firstItemInArticleGroup = articleGroup.articles.head
    firstItemInArticleGroup.overline should be(Some("A kicker"))
    firstItemInArticleGroup.author should be(None)
  }

  "TrailToShowcase" should "fall back to authors of some rundown articles are miss kickers" in {
    val withAuthorAndKicker = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      kickerText = Some("A kicker"),
      byline = Some("A byline"),
      trailPicture = Some(imageMedia),
    )

    val withMissingKicker = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      byline = Some("A byline"),
      trailPicture = Some(imageMedia),
    )

    val rundownPanel = TrailsToShowcase
      .asRundownPanel(
        "Rundown container name",
        Seq(withAuthorAndKicker, withAuthorAndKicker, withMissingKicker),
        "rundown-container-id",
      )
      .get

    val gModule = rundownPanel.getModule(GModule.URI).asInstanceOf[GModule]
    val articleGroup = gModule.getArticleGroup.get
    articleGroup.articles.forall(_.author.nonEmpty) should be(true)
    articleGroup.articles.forall(_.overline.isEmpty) should be(true)
  }

  "TrailToShowcase" should "reject rundown panels if the articles do not have a complete set of authors of kickers" in {
    val withKicker = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      kickerText = Some("A kicker"),
      trailPicture = Some(imageMedia),
    )

    val withAuthor = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      byline = Some("A byline"),
      trailPicture = Some(imageMedia),
    )

    val rundownPanel = TrailsToShowcase
      .asRundownPanel("Rundown container name", Seq(withKicker, withKicker, withAuthor), "rundown-container-id")

    rundownPanel should be(None)
  }

  "TrailToShowcase" can "rundown panels articles should prefer replaced images over content trail image" in {
    val withReplacedImage = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      replacedImage = Some(replacedImage),
      headline = "My unique headline",
      kickerText = Some("Kicker"),
    )

    val rundownPanel = TrailsToShowcase
      .asRundownPanel("Rundown contained", Seq(withReplacedImage, withReplacedImage, withReplacedImage), "rundown-id")
      .get

    val gModule = rundownPanel.getModule(GModule.URI).asInstanceOf[GModule]
    val articleGroup = gModule.getArticleGroup.get
    articleGroup.articles.head.mediaContent.get.getReference shouldBe (new com.sun.syndication.feed.module.mediarss.types.UrlReference(
      "http://localhost/replaced-image.jpg",
    ))
  }

  "TrailToShowcase" can "should default rundown items updated publication date if no last updated value is available" in {
    val content = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      trailPicture = Some(imageMedia),
      kickerText = Some("Kicker"),
    )

    val rundownPanel = TrailsToShowcase
      .asRundownPanel("Rundown container name", Seq(content, content, content), "rundown-container-id")
      .get

    val gModule = rundownPanel.getModule(GModule.URI).asInstanceOf[GModule]
    val articleGroup = gModule.getArticleGroup.get
    articleGroup.articles.head.updated shouldBe (wayBackWhen)
  }

  // This always passes because we are not setting this optional field
  "TrailToShowcase validation" should "omit single panel g:panel_titles longer than 74 characters" in {
    val content = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      trailText = Some("- A bullet"),
    )

    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(content).get

    val gModule = singleStoryPanel.getModule(GModule.URI).asInstanceOf[GModule]
    gModule.getPanelTitle should be(None)
  }

  "TrailToShowcase validation" should "omit single panel g:overlines longer than 30 characters" in {
    val longerThan30 = "This sentence is way longer than 30 characters and should be omitted"
    longerThan30.size > 30 should be(true)

    val content = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      kickerText = Some(longerThan30),
      trailText = Some("- A bullet"),
    )

    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(content).get

    val gModule = singleStoryPanel.getModule(GModule.URI).asInstanceOf[GModule]
    gModule.getOverline should be(None)
  }

  "TrailToShowcase validation" should "reject single panels with titles longer than 86 characters" in {
    val longerThan30 = "This sentence is way longer than 30 characters and should be omitted"
    val longerThan86 = longerThan30 + longerThan30 + longerThan30
    longerThan86.size > 86 should be(true)

    val withLongTitle = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      headline = longerThan86,
    )

    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(withLongTitle)

    singleStoryPanel should be(None)
  }

  "TrailToShowcase validation" should "omit single panel author fields longer than 42 characters" in {
    val longerThan42 = "This sentence is way longer than 40 characters and should obviously be omitted"
    longerThan42.size > 42 should be(true)

    val withLongByline = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      byline = Some(longerThan42),
      trailText = Some("- A bullet"),
    )

    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(withLongByline).get

    singleStoryPanel.getAuthor should be("") // TODO Javadoc says this should be null
  }

  "TrailToShowcase validation" should "reject single panels with no image" in {
    val withNoImage = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
    )

    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(withNoImage)

    singleStoryPanel should be(None)
  }

  "TrailToShowcase validation" should "reject single panels with images smaller than 640x320" in {
    val withTooSmallImage = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(smallImageMedia),
    )

    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(withTooSmallImage)

    singleStoryPanel should be(None)
  }

  "TrailToShowcase validation" should "reject rundown panels with less than 3 articles" in {
    val content = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
    )

    val rundownPanel =
      TrailsToShowcase.asRundownPanel("Rundown container with too few articles", Seq(content), "rundown-container-id")

    rundownPanel should be(None)
  }

  "TrailToShowcase validation" should "trim rundown panels to 3 articles if too many are supplied" in {
    val content = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      kickerText = Some("Kicker"),
    )

    val rundownPanel = TrailsToShowcase
      .asRundownPanel(
        "Rundown container with too many articles",
        Seq(content, content, content, content),
        "rundown-container-id",
      )
      .get

    val gModule = rundownPanel.getModule(GModule.URI).asInstanceOf[GModule]
    val articleGroup = gModule.getArticleGroup.get
    articleGroup.articles.size should be(3)
  }

  "TrailToShowcase validation" should "reject rundown panels with g:panel_titles longer than 74 characters" in {
    val trail = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
    )
    val anotherTrail =
      makePressedContent(webPublicationDate = Some(wayBackWhen), lastModified = Some(lastModifiedWayBackWhen))

    val longerThan74 =
      "The container name is really really long is Showcase aer well within their rights to reject this"
    longerThan74.length > 74 should be(true)

    val rundownPanel = TrailsToShowcase.asRundownPanel(longerThan74, Seq(trail, anotherTrail), "rundown-container-id")

    rundownPanel should be(None)
  }

  "TrailToShowcase validation" should "omit rundown panel articles g:overlines longer than 30 characters" in {
    val longerThan30 = "This kicker is way longer than 30 characters and should be omitted"
    longerThan30.length > 30 should be(true)

    val withTooLongKicker = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      kickerText = Some(longerThan30),
    )

    val rundownPanel = TrailsToShowcase
      .asRundownPanel(
        "Rundown container name",
        Seq(withTooLongKicker, withTooLongKicker, withTooLongKicker),
        "rundown-container-id",
      )

    rundownPanel should be(None)
  }

  "TrailToShowcase validation" should "reject rundown panel articles with titles longer than 64 characters" in {
    val longerThan30 = "This sentence is way longer than 30 characters and should be omitted"
    val longerThan64 = longerThan30 + longerThan30 + "blah blah"
    longerThan64.length > 64 should be(true)

    val withTooLongHeadline = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      headline = longerThan64,
    )

    val rundownPanel = TrailsToShowcase.asRundownPanel(
      "Rundown container name",
      Seq(withTooLongHeadline, withTooLongHeadline, withTooLongHeadline),
      "rundown-container-id",
    )

    rundownPanel should be(None)
  }

  "TrailToShowcase validation" should "reject rundown panels containing articles with images smaller than 1200x900" in {
    val withTooSmallImage = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(mediumImageMedia),
    )

    val rundownPanel = TrailsToShowcase
      .asRundownPanel(
        "Rundown container name",
        Seq(withTooSmallImage, withTooSmallImage, withTooSmallImage),
        "rundown-container-id",
      )

    rundownPanel should be(None)
  }

  "TrailToShowcase validation" should "omit kickers from rundown panels if kicker is not set on all articles" in {
    val withKicker = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      kickerText = Some("Kicker"),
      byline = Some("A byline"),
    )
    val withoutKicker = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      byline = Some("A byline"),
    )

    val rundownPanel = TrailsToShowcase
      .asRundownPanel(
        "Rundown container name",
        Seq(withKicker, withKicker, withoutKicker),
        "rundown-container-id",
      )
      .get

    val gModule = rundownPanel.getModule(GModule.URI).asInstanceOf[GModule]
    val articleGroup = gModule.getArticleGroup.get
    articleGroup.articles.size should be(3)
    articleGroup.articles.forall(_.overline.isEmpty) should be(true)
  }

  "TrailToShowcase validation" should "omit authors from rundown panel articles of author has not been set on all articles" in {
    val withAuthor = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      byline = Some("An author"),
    )
    val withoutAuthor = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
    )

    val rundownPanel = TrailsToShowcase
      .asRundownPanel(
        "Rundown container name",
        Seq(withAuthor, withAuthor, withoutAuthor),
        "rundown-container-id",
      )

    rundownPanel should be(None)
  }

  "TrailToShowcase validation" should "choose kickers over authors" in {
    val withAuthorAndKicker = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      byline = Some("An author"),
      kickerText = Some("A kicker"),
    )

    val rundownPanel = TrailsToShowcase
      .asRundownPanel(
        "Rundown container name",
        Seq(withAuthorAndKicker, withAuthorAndKicker, withAuthorAndKicker),
        "rundown-container-id",
      )
      .get

    val gModule = rundownPanel.getModule(GModule.URI).asInstanceOf[GModule]
    val articleGroup = gModule.getArticleGroup.get
    articleGroup.articles.size should be(3)
    articleGroup.articles.forall(_.overline.nonEmpty) should be(true)
    articleGroup.articles.forall(_.author.isEmpty) should be(true)
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
                                  webPublicationDate: Option[DateTime] = None,
                                  lastModified: Option[DateTime] = None,
                                  trailPicture: Option[ImageMedia] = None,
                                  replacedImage: Option[Image] = None,
                                  headline: String = "A headline",
                                  byline: Option[String] = None,
                                  kickerText: Option[String] = None,
                                  trailText: Option[String] = Some("Some trail text"),
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
      webPublicationDate = webPublicationDate.map(jodaToJavaInstant(_).atOffset(ZoneOffset.UTC).toCapiDateTime),
      webTitle = title,
      webUrl = webUrl,
      apiUrl = "",
      fields = None,
    )
    val trail = PressedTrail(
      trailPicture = trailPicture,
      byline = None,
      thumbnailPath = None,
      webPublicationDate = webPublicationDate.get, // TODO Naked get
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
      webPublicationDateOption = webPublicationDate,
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
      supportingContent = Seq.empty.toList,
      cardStyle = CardStyle.make(Editorial),
    )
  }

}
