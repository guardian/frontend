package common

import com.sun.syndication.feed.module.Module
import com.sun.syndication.feed.module.mediarss.MediaEntryModuleImpl
import com.sun.syndication.feed.module.mediarss.types.{MediaContent, Metadata, UrlReference}
import com.sun.syndication.feed.synd._
import com.sun.syndication.io.SyndFeedOutput
import common.TrailsToRss.image
import model.ImageAsset
import model.pressed.{PressedContent, Replace}
import org.joda.time.DateTime
import play.api.mvc.RequestHeader

import java.io.StringWriter
import java.util.Date
import scala.collection.JavaConverters._
import scala.collection.immutable.WrappedString

object TrailsToShowcase {

  private val Rundown = "RUNDOWN"
  private val SingleStory = "SINGLE_STORY"

  private val MaxLengthForSinglePanelTitle = 86
  private val MaxLengthForSinglePanelAuthor = 42
  private val MaxOverlineLength = 30
  private val MaxBulletLength = 118
  private val MaxBulletsAllowed = 3

  private val MaxLengthForRundownPanelTitle = 74
  private val MaxLengthForRundownPanelArticleTitle = 64

  def apply(
      feedTitle: Option[String],
      singleStories: Seq[PressedContent],
      rundownStories: Seq[PressedContent],
      rundownContainerTitle: String,
      rundownContainerId: String,
      url: Option[String] = None,
      description: Option[String] = None,
  )(implicit request: RequestHeader): String = {
    val panels = makePanelsFor(singleStories, rundownStories, rundownContainerTitle, rundownContainerId)

    // Map panels to RSS items
    val entries = panels.map {
      case singleStoryPanel: SingleStoryPanel => asSyndEntry(singleStoryPanel)
      case rundownPanel: RundownPanel         => asSyndEntry(rundownPanel)
    }

    val feed = syndFeedOf(feedTitle, url, description, entries)
    asString(feed)
  }

  def makePanelsFor(
      singleStoryTrails: Seq[PressedContent],
      rundownStoryTrails: Seq[PressedContent],
      rundownContainerTitle: String,
      rundownContainerId: String,
  ): Seq[Panel] = {
    val singleStoryPanelCreationOutcomes = singleStoryTrails.map(asSingleStoryPanel)
    val singleStoryPanels = singleStoryPanelCreationOutcomes.flatMap(_.toOption)
    asRundownPanel(rundownContainerTitle, rundownStoryTrails, rundownContainerId)
      .map { rundownPanel =>
        singleStoryPanels :+ rundownPanel
      }
      .getOrElse(
        singleStoryPanels,
      )
  }

  def asSingleStoryPanel(content: PressedContent): Either[Seq[String], SingleStoryPanel] = {
    val proposedTitle = TrailsToRss.stripInvalidXMLCharacters(titleFrom(content))
    val proposedImageUrl = singleStoryImageUrlFor(content)
    val maybePanel = for {
      // Collect all mandatory values; any missing will result in a None entry
      title <- Some(proposedTitle).filter(_.length <= MaxLengthForSinglePanelTitle)
      webUrl <- webUrl(content)
      imageUrl <- proposedImageUrl
      bulletList: BulletList <- content.card.trailText.flatMap(extractBulletsFrom)

    } yield {
      // Build a panel
      val published = content.card.webPublicationDateOption
      val updated = Seq(content.card.lastModifiedOption, content.card.webPublicationDateOption).flatten.headOption
      SingleStoryPanel(
        title = title,
        link = webUrl,
        author = bylineFrom(content),
        overline = kickerFrom(content),
        bulletList = Some(bulletList),
        imageUrl = imageUrl,
        published = published,
        updated = updated,
      )
    }
    maybePanel.map { Right(_) }.getOrElse {
      // Possible errors
      val titleTooLong = if (proposedTitle.length > MaxLengthForSinglePanelTitle) {
        Some("Headline was longer than " + MaxLengthForSinglePanelTitle + " characters")
      } else {
        None
      }
      val noImage = if (proposedImageUrl.isEmpty) {
        Some("Single story panel had no image")
      } else {
        None
      }
      Left(Seq(titleTooLong, noImage).flatten)
    }
  }

  def asRundownPanel(panelTitle: String, content: Seq[PressedContent], id: String): Option[RundownPanel] = {
    def makeArticlesFrom(content: Seq[PressedContent]): Option[Seq[RundownArticle]] = {
      val validArticles = content.flatMap { contentItem =>
        // Collect the mandatory fields for the article. If any of these are missing we can skip this item
        for {
          webPublicationDate <- contentItem.card.webPublicationDateOption
          title <- Some(TrailsToRss.stripInvalidXMLCharacters(titleFrom(contentItem)))
            .filter(_.nonEmpty)
            .filter(_.length <= MaxLengthForRundownPanelArticleTitle)
          guid <- guidFor(contentItem)
          webUrl <- webUrl(contentItem)
          imageUrl <- rundownPanelArticleImageUrlFor(contentItem)
        } yield {
          val lastModified = contentItem.card.lastModifiedOption.getOrElse(webPublicationDate)
          RundownArticle(
            guid,
            title,
            webUrl,
            webPublicationDate,
            lastModified,
            bylineFrom(contentItem),
            kickerFrom(contentItem),
            Some(imageUrl),
          )
        }
      }
      // We require exactly 3 articles for a valid rundown panel
      val threeArticlesToUse = Some(validArticles.take(3)).filter(_.size == 3)

      // Ensure author and kickers are consistent with validation rules
      // If an author is used on any article it must be used on all of them
      // If a kicker is used on any article it must be used on all of them
      // You cannot mix authors and kickers
      threeArticlesToUse.flatMap { articles =>
        // Most of our content has bylines. Kicker is an optional override in our tools
        // Therefore we should default to using author tags if it is available on all the articles.
        // If kickers have been supplied for all articles we will use that in preference to authors
        val allAuthorsPresent = articles.forall(_.author.nonEmpty)
        val allKickersPresent = articles.forall(_.overline.nonEmpty)
        if (allKickersPresent) {
          // Use kickers; remove any authors
          Some(articles.map(_.copy(author = None)))
        } else if (allAuthorsPresent) {
          // Use authors; remove any kickers
          Some(articles.map(_.copy(overline = None)))
        } else {
          // We can't use these articles as all author or all overline is a requirement
          None
        }
      }
    }

    // Collect mandatory fields. If any of these is missing we can yield None
    for {
      panelTitle <- Some(panelTitle).filter(_.nonEmpty).filter(_.length <= MaxLengthForRundownPanelTitle)
      articles <- makeArticlesFrom(content)
    } yield {
      // Create a rundown panel
      // Make a questionable inference of the panels publication and update times from it's articles
      val published = articles.map(_.published).sortBy(_.getMillis).lastOption
      val updated = articles.map(_.updated).sortBy(_.getMillis).lastOption

      RundownPanel(
        guid = id,
        panelTitle = panelTitle,
        articles = articles,
        published = published,
        updated = updated,
      )
    }
  }

  private def atomDatesModuleFor(published: Option[DateTime], updated: Option[DateTime]): RssAtomModuleImpl = {
    val atomModule = new RssAtomModuleImpl
    atomModule.setPublished(published)
    atomModule.setUpdated(
      updated,
    )
    atomModule
  }

  private def addModuleTo(entry: SyndEntry, module: Module): Unit = {
    val modules = entry.getModules
    entry.setModules((modules.asScala ++ Seq(module)).asJava)
  }

  private def singleStoryImageUrlFor(content: PressedContent): Option[String] = {
    def bigEnoughForSingleStoryPanel(imageAsset: ImageAsset) = imageAsset.width >= 640 && imageAsset.height >= 320
    findBestImageFor(content, bigEnoughForSingleStoryPanel)
  }

  private def rundownPanelArticleImageUrlFor(content: PressedContent): Option[String] = {
    def bigEnoughForRundownPanel(imageAsset: ImageAsset) = imageAsset.width >= 1200 && imageAsset.height >= 900
    findBestImageFor(content, bigEnoughForRundownPanel)
  }

  private def findBestImageFor(
      content: PressedContent,
      imageSizeFilter: ImageAsset => Boolean,
  ): Option[String] = {
    // There will be a default trail image on the content attached to this trail.
    // There may also be a replacement image on the trail itself if the editor has replaced the image.
    val replacementImageAsset = content.properties.image
      .flatMap {
        case replace: Replace =>
          val empty = Map(
            "width" -> replace.imageSrcWidth,
            "height" -> replace.imageSrcHeight,
          )
          Some(
            ImageAsset(url = Some(replace.imageSrc), mimeType = None, mediaType = "", fields = empty),
          ) // Caution this is an incomplete mapping
        case _ => None
      }

    val contentTrailImageAsset = content.properties.maybeContent.map(_.trail).flatMap { trail =>
      trail.trailPicture.flatMap { imageMedia =>
        imageMedia.largestImage
      }
    }

    // Of the available image assets take the first which is large enough and has a url
    Seq(replacementImageAsset, contentTrailImageAsset).flatten.filter(imageSizeFilter).flatMap(_.url).headOption
  }

  private def guidFor(content: PressedContent): Option[String] = webUrl(content)

  private def webUrl(content: PressedContent): Option[String] =
    content.properties.maybeContent.map(_.metadata.webUrl)

  private def titleFrom(content: PressedContent): String = content.header.headline

  private def bylineFrom(content: PressedContent): Option[String] = {
    content.properties.byline.filter(_.nonEmpty).filter(_.length <= MaxLengthForSinglePanelAuthor)
  }

  private def kickerFrom(content: PressedContent): Option[String] = {
    content.header.kicker.flatMap(_.properties.kickerText).filter(_.length <= MaxOverlineLength)
  }

  private def extractBulletsFrom(trailText: String): Option[BulletList] = {
    val bulletTrailPrefix = "-"
    val lines = new WrappedString(trailText).lines.toSeq

    val proposedBulletTexts = lines
      .map(_.stripLeading)
      .filter { line =>
        line.startsWith(bulletTrailPrefix)
      }
      .map(_.replaceFirst(bulletTrailPrefix, "").trim)

    val validBulletTexts = proposedBulletTexts.filter(_.length <= MaxBulletLength)

    val bulletListItemsToUse =
      validBulletTexts.map(BulletListItem).take(MaxBulletsAllowed) // 3 is the maximum permitted number of bullets

    if (bulletListItemsToUse.nonEmpty) {
      Some(BulletList(bulletListItemsToUse))
    } else {
      None
    }
  }

  private def syndFeedOf(
      title: Option[String],
      url: Option[String],
      description: Option[String],
      entries: Seq[SyndEntry],
  ): SyndFeed = {
    val feedTitle = title.map(t => s"$t | The Guardian").getOrElse("The Guardian")

    // Feed
    val feed = new SyndFeedImpl
    feed.setFeedType("rss_2.0")
    feed.setTitle(feedTitle)
    feed.setDescription(
      description.getOrElse("Latest news and features from theguardian.com, the world's leading liberal voice"),
    )
    feed.setLink("https://www.theguardian.com" + url.getOrElse(""))
    feed.setLanguage("en-gb")
    feed.setCopyright(
      s"Guardian News &amp; Media Limited or its affiliated companies. All rights reserved. ${RssDates
        .getYear(new Date())}",
    )
    feed.setImage(image)
    feed.setPublishedDate(new Date())
    feed.setEncoding("utf-8")
    feed.setEntries(entries.asJava)
    feed
  }

  private def asString(feed: SyndFeed) = {
    val writer = new StringWriter()
    val output = new SyndFeedOutput()
    output.output(feed, writer)
    writer.close()
    writer.toString
  }

  def asSyndEntry(singleStoryPanel: SingleStoryPanel): SyndEntry = {
    val entry = new SyndEntryImpl()
    entry.setTitle(singleStoryPanel.title)
    entry.setLink(singleStoryPanel.link)
    entry.setUri(singleStoryPanel.guid)

    val gModule = new GModuleImpl()
    gModule.setPanel(Some(singleStoryPanel.`type`))
    gModule.setOverline(singleStoryPanel.overline)
    gModule.setBulletList(singleStoryPanel.bulletList)
    addModuleTo(entry, gModule)

    // and add the showcase formatted asset
    val mediaModule = new MediaEntryModuleImpl()
    mediaModule.setMediaContents(Seq(new MediaContent(new UrlReference(singleStoryPanel.imageUrl))).toArray)
    mediaModule.setMetadata(new Metadata())
    addModuleTo(entry, mediaModule)

    val atomModule = atomDatesModuleFor(singleStoryPanel.published, singleStoryPanel.updated)
    addModuleTo(entry, atomModule)

    singleStoryPanel.author.foreach { byline =>
      // Sidestep Rome's attempt to follow the RSS spec and only populate the author tag with email addresses
      val bylinePretendingToBePerson = new SyndPersonImpl()
      bylinePretendingToBePerson.setEmail(byline)
      entry.setAuthors(Seq(bylinePretendingToBePerson).asJava)
    }
    entry
  }

  def asSyndEntry(rundownPanel: RundownPanel): SyndEntry = {

    def asGArticle(rundownArticle: RundownArticle): GArticle = {
      GArticle(
        rundownArticle.guid,
        rundownArticle.title,
        rundownArticle.link,
        rundownArticle.published,
        rundownArticle.updated,
        rundownArticle.author,
        rundownArticle.overline,
        rundownArticle.imageUrl.map(i => new MediaContent(new UrlReference(i))),
      )
    }

    val entry = new SyndEntryImpl
    entry.setUri(rundownPanel.guid)

    val gModule = new GModuleImpl()
    gModule.setPanel(Some(rundownPanel.`type`))
    gModule.setPanelTitle(Some(rundownPanel.panelTitle))
    gModule.setArticleGroup(Some(ArticleGroup(role = Some(Rundown), rundownPanel.articles.map(asGArticle))))
    addModuleTo(entry, gModule)

    addModuleTo(entry, atomDatesModuleFor(rundownPanel.published, rundownPanel.updated))
    entry
  }

  trait Panel {
    def `type`: String
    def guid: String
    def published: Option[DateTime]
    def updated: Option[DateTime]
  }

  case class SingleStoryPanel(
      title: String,
      link: String,
      overline: Option[String],
      bulletList: Option[BulletList],
      imageUrl: String,
      author: Option[String],
      published: Option[DateTime],
      updated: Option[DateTime],
      panelTitle: Option[String] = None,
  ) extends Panel {
    val `type`: String = SingleStory
    def guid: String = link
  }

  case class RundownPanel(
      guid: String,
      panelTitle: String,
      articles: Seq[RundownArticle],
      published: Option[DateTime],
      updated: Option[DateTime],
  ) extends Panel {
    val `type`: String = Rundown
  }

  case class RundownArticle(
      guid: String,
      title: String,
      link: String,
      published: DateTime,
      updated: DateTime,
      author: Option[String],
      overline: Option[String],
      imageUrl: Option[String],
  )

}
