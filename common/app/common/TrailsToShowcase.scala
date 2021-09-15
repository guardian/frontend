package common

import com.sun.syndication.feed.module.Module
import com.sun.syndication.feed.module.mediarss.MediaEntryModuleImpl
import com.sun.syndication.feed.module.mediarss.types.{MediaContent, Metadata, UrlReference}
import com.sun.syndication.feed.synd._
import com.sun.syndication.io.SyndFeedOutput
import common.TrailsToRss.image
import model.pressed.{PressedContent, Replace}
import model.{ImageAsset, PressedPage}
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
      url: Option[String] = None,
      description: Option[String] = None,
      singleStoryPanels: Seq[SingleStoryPanel],
      maybeRundownPanel: Option[RundownPanel],
  )(implicit request: RequestHeader): String = {
    // Map panels to RSS items
    val allPanels = singleStoryPanels ++ maybeRundownPanel.toSeq
    val entries = allPanels.map {
      case singleStoryPanel: SingleStoryPanel => asSyndEntry(singleStoryPanel)
      case rundownPanel: RundownPanel         => asSyndEntry(rundownPanel)
    }
    asString(syndFeedOf(feedTitle, url, description, entries))
  }

  def fromTrails(
      feedTitle: Option[String],
      singleStories: Seq[PressedContent],
      rundownStories: Seq[PressedContent],
      rundownContainerTitle: String,
      rundownContainerId: String,
      url: Option[String] = None,
      description: Option[String] = None,
  )(implicit request: RequestHeader): String = {
    val (rundownPanelOutcome, singleStoryPanelOutcomes) =
      makePanelsFor(singleStories, rundownStories, rundownContainerTitle, rundownContainerId)
    val singleStoryPanels = singleStoryPanelOutcomes.flatMap(_.toOption)
    val maybeRundownPanel = rundownPanelOutcome.toOption
    TrailsToShowcase(feedTitle, url, description, singleStoryPanels, maybeRundownPanel)
  }

  // Questionable placement of controller logic
  def isShowcaseFront(faciaPage: PressedPage): Boolean = {
    faciaPage.frontProperties.priority.contains("showcase")
  }

  // Questionable placement of controller logic
  def generatePanelsFrom(
      faciaPage: PressedPage,
  ): (Either[Seq[String], RundownPanel], Seq[Either[Seq[String], SingleStoryPanel]]) = {
    // Given our pressed page locate the single story and rundown collections and convert their trails into panels
    val maybeSingleStoriesCollection = faciaPage.collections.find(_.displayName == "Standalone")
    val maybeRundownCollection = faciaPage.collections.find(_.displayName == "Rundown")

    (for {
      singleStoriesCollection <- maybeSingleStoriesCollection
      rundownCollection <- maybeRundownCollection
    } yield {
      TrailsToShowcase.makePanelsFor(
        singleStoryTrails = singleStoriesCollection.curated,
        rundownStoryTrails = rundownCollection.curated,
        rundownContainerId = rundownCollection.id,
        rundownContainerTitle = rundownCollection.displayName,
      )

    }).getOrElse {
      (Left(Seq("Could not find the required Showcase single story and rundown collections")), Seq.empty)
    }
  }

  def makePanelsFor(
      singleStoryTrails: Seq[PressedContent],
      rundownStoryTrails: Seq[PressedContent],
      rundownContainerTitle: String,
      rundownContainerId: String,
  ): (Either[Seq[String], RundownPanel], Seq[Either[Seq[String], SingleStoryPanel]]) = {
    val rundownPanelOutcome = asRundownPanel(rundownContainerTitle, rundownStoryTrails, rundownContainerId)
    val singleStoryPanelCreationOutcomes = singleStoryTrails.map(asSingleStoryPanel)
    (rundownPanelOutcome, singleStoryPanelCreationOutcomes)
  }

  def asSingleStoryPanel(content: PressedContent): Either[Seq[String], SingleStoryPanel] = {
    val trailTitle = TrailsToRss.stripInvalidXMLCharacters(titleFrom(content))
    val proposedTitle = Some(trailTitle)
      .filter(_.nonEmpty)
      .filter(_.length <= MaxLengthForSinglePanelTitle)
      .map(Right(_))
      .getOrElse(
        Left(Seq(s"The headline '$trailTitle' is longer than " + MaxLengthForSinglePanelTitle + " characters")),
      )
    val proposedWebUrl = webUrl(content).map(Right(_)).getOrElse(Left(Seq("Trail had no web url")))
    val proposedImageUrl = singleStoryImageUrlFor(content)
    val proposedBulletList =
      content.card.trailText.map(extractBulletsFrom).getOrElse(Left(Seq("No trail text available")))

    // Collect all mandatory values; any missing will result in a None entry
    val proposedOverline = overlineFrom(content)

    val maybePanel = for {
      title <- proposedTitle.toOption
      webUrl <- proposedWebUrl.toOption
      imageUrl <- proposedImageUrl.toOption
      bulletList <- proposedBulletList.toOption
      maybeOverline <- proposedOverline.toOption

    } yield {
      // Build a panel
      val published = content.card.webPublicationDateOption
      val updated = Seq(content.card.lastModifiedOption, content.card.webPublicationDateOption).flatten.headOption
      SingleStoryPanel(
        title = title,
        link = webUrl,
        author = bylineFrom(content),
        overline = maybeOverline,
        bulletList = Some(bulletList),
        imageUrl = imageUrl,
        published = published,
        updated = updated,
      )
    }

    maybePanel.map { Right(_) }.getOrElse {
      // Round up all of the potential sources of hard errors and collect their objections
      Left(
        Seq(proposedTitle, proposedWebUrl, proposedImageUrl, proposedBulletList, proposedOverline)
          .flatMap(_.left.toOption)
          .flatten,
      )
    }
  }

  def asRundownPanel(
      panelTitle: String,
      content: Seq[PressedContent],
      id: String,
  ): Either[Seq[String], RundownPanel] = {
    def makeArticlesFrom(content: Seq[PressedContent]): Either[Seq[String], Seq[RundownArticle]] = {
      val articleOutcomes = content.map { contentItem =>
        // Collect the mandatory fields for the article. If any of these are missing we can skip this item
        val trailTitle = TrailsToRss.stripInvalidXMLCharacters(titleFrom(contentItem))
        val proposedArticleTitle = Some(trailTitle)
          .filter(_.length <= MaxLengthForRundownPanelArticleTitle)
          .map(Right(_))
          .getOrElse(
            Left(Seq(s"The headline '$trailTitle' is longer than $MaxLengthForRundownPanelArticleTitle characters")),
          )
        val proposedArticleImage = rundownPanelArticleImageUrlFor(contentItem)
        val proposedOverline = overlineFrom(contentItem)

        val maybeArticle = for {
          webPublicationDate <- contentItem.card.webPublicationDateOption
          title <- proposedArticleTitle.toOption
          guid <- guidFor(contentItem)
          webUrl <- webUrl(contentItem)
          imageUrl <- proposedArticleImage.right.toOption
          maybeOverline <- proposedOverline.toOption
        } yield {
          val lastModified = contentItem.card.lastModifiedOption.getOrElse(webPublicationDate)
          RundownArticle(
            guid,
            title,
            webUrl,
            webPublicationDate,
            lastModified,
            bylineFrom(contentItem),
            maybeOverline,
            Some(imageUrl),
          )
        }

        maybeArticle.map(Right(_)).getOrElse {
          val problems = Seq(proposedArticleTitle, proposedArticleImage, proposedOverline).map(_.left.toOption)
          Left(problems)
        }
      }

      // We require exactly 3 articles for a valid rundown panel
      val threeArticlesToUse = Some(articleOutcomes.flatMap(_.toOption).take(3)).filter(_.size == 3)

      threeArticlesToUse
        .map { articles =>
          // Most of our content has bylines. Kicker is an optional override in our tools
          // Therefore we should default to using author tags if it is available on all the articles.
          // If kickers have been supplied for all articles we will use that in preference to authors
          val allAuthorsPresent = articles.forall(_.author.nonEmpty)
          val allKickersPresent = articles.forall(_.overline.nonEmpty)
          if (allKickersPresent) {
            // Use kickers; remove any authors
            Right(articles.map(_.copy(author = None)))
          } else if (allAuthorsPresent) {
            // Use authors; remove any kickers
            Right(articles.map(_.copy(overline = None)))
          } else {
            // We can't use these articles as all author or all overline is a requirement
            Left(Seq("Rundown trails need to all have Kickers or Bylines"))
          }
        }
        .getOrElse {
          val articleProblems = articleOutcomes
            .flatMap(_.left.toOption)
            .flatten
            .flatten
            .flatten
          // Couldn not make 3 valid articles is the most useful message to the editor so put it first
          Left("Could not find 3 valid rundown article trails" +: articleProblems)
        }
    }

    // Collect mandatory fields. If any of these is missing we can yield None
    val proposedPanelTitle = Some(panelTitle)
      .filter(_.nonEmpty)
      .filter(_.length <= MaxLengthForRundownPanelTitle)
      .map(Right(_))
      .getOrElse(Left(Seq("Rundown panel title is too long")))
    val proposedRundownArticles = makeArticlesFrom(content)

    val maybeRundownPanel = for {
      panelTitle <- proposedPanelTitle.toOption
      articles <- proposedRundownArticles.toOption
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

    maybeRundownPanel.map(Right(_)).getOrElse {
      // Collect everyone's objections
      val problems = Seq(proposedPanelTitle, proposedRundownArticles).flatMap(_.left.toOption).flatten
      Left(problems)
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

  private def singleStoryImageUrlFor(content: PressedContent): Either[Seq[String], String] =
    findBestImageFor(content, 640, 320)

  private def rundownPanelArticleImageUrlFor(content: PressedContent): Either[Seq[String], String] =
    findBestImageFor(content, 1200, 900)

  private def findBestImageFor(
      content: PressedContent,
      minimumWidth: Int,
      minimumHeight: Int,
  ): Either[Seq[String], String] = {
    def bigEnough(imageAsset: ImageAsset) = imageAsset.width >= minimumWidth && imageAsset.height >= minimumHeight

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
    val availableImages = Seq(replacementImageAsset, contentTrailImageAsset).flatten
    if (availableImages.nonEmpty) {
      availableImages
        .filter(bigEnough)
        .flatMap(_.url)
        .headOption
        .map(Right(_))
        .getOrElse(
          Left(Seq(s"Could not find image bigger than the minimum required size: ${minimumWidth}x$minimumHeight")),
        )
    } else {
      Left(Seq("No image available"))
    }
  }

  private def guidFor(content: PressedContent): Option[String] = webUrl(content)

  private def webUrl(content: PressedContent): Option[String] =
    content.properties.maybeContent.map(_.metadata.webUrl)

  private def titleFrom(content: PressedContent): String = content.header.headline

  private def bylineFrom(content: PressedContent): Option[String] = {
    content.properties.byline.filter(_.nonEmpty).filter(_.length <= MaxLengthForSinglePanelAuthor)
  }

  private def overlineFrom(contentItem: PressedContent): Either[Seq[String], Option[String]] = {
    def kickerFrom(content: PressedContent): Option[String] = {
      content.header.kicker.flatMap(_.properties.kickerText)
    }
    kickerFrom(contentItem)
      .map { kicker =>
        if (kicker.length <= MaxOverlineLength) {
          Right(Some(kicker))
        } else {
          Left(Seq(s"Kicker text '$kicker' is too long"))
        }
      }
      .getOrElse {
        Right(None)
      }
  }

  private def extractBulletsFrom(trailText: String): Either[Seq[String], BulletList] = {
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
      Right(BulletList(bulletListItemsToUse))
    } else {
      Left(Seq("Trail text is not formatted as a bullet list"))
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
