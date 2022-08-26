package common

import com.sun.syndication.feed.module.Module
import com.sun.syndication.feed.module.mediarss.MediaEntryModuleImpl
import com.sun.syndication.feed.module.mediarss.types.{MediaContent, Metadata, UrlReference}
import com.sun.syndication.feed.synd._
import com.sun.syndication.io.SyndFeedOutput
import common.TrailsToRss.image
import model.pressed.{CuratedContent, PressedContent, Replace}
import model.{ImageAsset, PressedPage}
import org.joda.time.DateTime
import org.jsoup.Jsoup
import play.api.mvc.RequestHeader

import java.io.StringWriter
import java.util.Date
import scala.collection.JavaConverters._
import scala.collection.immutable.WrappedString

object TrailsToShowcase {

  private val Rundown = "RUNDOWN"
  private val SingleStory = "SINGLE_STORY"

  // We expect these collections to be available in Showcase fronts to source curated trails from
  private val RundownCollectionName = "Rundown"
  private val SingleStoriesCollectionName = "Single stories"

  private val MaxSinglePanelTitleLength = 86
  private val MaxSinglePanelAuthorLength = 42
  private val MaxOverlineLength = 30
  private val MaxBulletLength = 118
  private val MaxBulletsAllowed = 3

  private val MaxPanelTitleLength = 74
  private val MaxRundownArticleTitleLength = 64

  private val MaxRelatedArticleTitleLength = 54
  private val MaxRelatedArticleOverlineLength = 42
  private val MaxRelatedArticlesPanelSummaryLength = 82

  // Panel titles can encoded with a pipe delimiter in the trail headline.
  private val PanelTitleInHeadlineDelimiter = '|'

  // Bullet list items are delimited with a hyphen
  private val BulletTrailPrefix = "-"

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
      singleTrails: Seq[PressedContent],
      rundownTrails: Seq[PressedContent],
      rundownContainerId: String,
      url: Option[String] = None,
      description: Option[String] = None,
      collectionLastUpdated: Option[DateTime] = None,
  )(implicit request: RequestHeader): String = {
    val rundownPanelOutcome = asRundownPanel(rundownTrails, rundownContainerId, collectionLastUpdated)
    val singleStoryPanelOutcomes = singleTrails.map(asSingleStoryPanel)

    val maybeRundownPanel = rundownPanelOutcome.toOption
    val singleStoryPanels = singleStoryPanelOutcomes.flatMap(_.toOption)
    TrailsToShowcase(feedTitle, url, description, singleStoryPanels, maybeRundownPanel)
  }

  // Questionable placement of controller logic
  def isShowcaseFront(faciaPage: PressedPage): Boolean = {
    faciaPage.frontProperties.priority.contains("showcase")
  }

  // Questionable placement of controller logic
  def generatePanelsFrom(
      faciaPage: PressedPage,
  ): (Either[Seq[String], RundownPanel], Seq[Either[Seq[String], SingleStoryPanel]], Map[String, Int]) = {
    // Given our pressed page locate the single story and rundown collections and convert their trails into panels
    val maybeRundownCollection = faciaPage.collections
      .find(_.displayName == RundownCollectionName)
      .toRight(Seq(s"Could not find the '$RundownCollectionName' collection to build the rundown panel from"))
    val rundownPanelOutcome = maybeRundownCollection.flatMap { collection =>
      asRundownPanel(collection.curated, collection.id, collection.lastUpdated)
    }

    val singleStoryCollections =
      faciaPage.collections.filter(_.displayName.trim.startsWith(SingleStoriesCollectionName))

    // duplicateMap will contain a list of content (card) id
    // and the number of instances of that id where there are more than one.
    // We don't seem to care if duplication exists between the single
    // stories and the rundown collection, only when something is
    // duplicated within the single stories collections.
    // TODO: figure out how to include the collection(s)
    //  the duplicates are in
    val duplicateMap = singleStoryCollections
      .flatMap(_.curated)
      .map(_.card.id)
      .groupBy(identity)
      .mapValues(_.size)
      .filter(_._2 > 1)

    val singleStoryPanelsOutcome = if (singleStoryCollections.nonEmpty) {
      // Attempt to map all trails from all single story collections to panels
      singleStoryCollections.flatMap(_.curated).map(asSingleStoryPanel)
    } else {
      Seq(
        Left(Seq(s"Could not find the '$SingleStoriesCollectionName' collection to build single story panels from")),
      )
    }

    (rundownPanelOutcome, singleStoryPanelsOutcome, duplicateMap)
  }

  def asSingleStoryPanel(content: PressedContent): Either[Seq[String], SingleStoryPanel] = {
    val proposedTitle = titleOfLengthFrom(MaxSinglePanelTitleLength, content)
    val proposedPanelTitle = panelTitleFrom(content)
    val proposedWebUrl = webUrl(content).map(Right(_)).getOrElse(Left(Seq("Trail had no web url")))
    val proposedImageUrl = singleStoryImageUrlFor(content)

    // Decide which type of panel to produce
    // If supporting content is present try to map into into a related articles article group for a Related Articles panel
    // If then try to produce a bullet item list for a Bullets panel
    // This might get more interesting if we implement Key Moments but the principal is the same.
    val supportingContent = content match {
      case curatedContent: CuratedContent =>
        curatedContent.supportingContent
      case _ => Seq.empty
    }

    val isRelatedArticlePanel = supportingContent.nonEmpty
    val proposedArticleGroup = {
      if (isRelatedArticlePanel) {
        if (supportingContent.nonEmpty) {
          makeArticlesFrom(
            supportingContent,
            2,
            "Related Article",
            MaxRelatedArticleTitleLength,
            MaxRelatedArticleOverlineLength,
          ).fold(
            { l =>
              Left(l)
            },
            { articles: Seq[Article] =>
              Right(Some(ArticleGroup(role = "RELATED_CONTENT", articles = articles)))
            },
          )
        } else {
          Right(None)
        }
      } else {
        // Not a related article panel so we will gracefully opt out
        Right(None)
      }
    }

    val proposedBulletList = {
      if (!isRelatedArticlePanel) {
        content.card.trailText
          .map(extractBulletsFrom)
          .getOrElse(Left(Seq("No trail text available to create a bullet list from")))
          .fold(
            { l => Left(l) },
            { bulletList =>
              Right(Some(bulletList))
            },
          )
      } else {
        Right(None)
      }
    }

    val proposedOverline = overlineFrom(content, MaxOverlineLength)

    val proposedSummary = {
      if (isRelatedArticlePanel) {
        extractRelatedArticlePanelSummaryFrom(content)
      } else {
        Right(None)
      }
    }

    val proposedPublicationDate =
      content.card.webPublicationDateOption.toRight(Seq("Could not find web publication date for panel"))

    // Collect all mandatory values; any missing will result in a None entry
    val maybePanel = for {
      title <- proposedTitle.toOption
      maybePanelTitle <- proposedPanelTitle.toOption
      webUrl <- proposedWebUrl.toOption
      imageUrl <- proposedImageUrl.toOption
      maybeOverline <- proposedOverline.toOption
      bulletList <- proposedBulletList.toOption
      articleGroup <- proposedArticleGroup.toOption
      summary <- proposedSummary.toOption
      published <- proposedPublicationDate.toOption
    } yield {
      // Build a panel
      SingleStoryPanel(
        title = title,
        panelTitle = maybePanelTitle,
        link = webUrl,
        author = bylineFrom(content),
        overline = maybeOverline,
        imageUrl = imageUrl,
        published = published,
        updated = content.card.lastModifiedOption.getOrElse(published),
        articleGroup = articleGroup,
        bulletList = bulletList,
        summary = summary,
      )
    }

    maybePanel.map { Right(_) }.getOrElse {
      // Round up all of the potential sources of hard errors and collect their objections
      Left(
        Seq(
          proposedTitle,
          proposedPanelTitle,
          proposedWebUrl,
          proposedImageUrl,
          proposedOverline,
          proposedArticleGroup,
          proposedBulletList,
          proposedSummary,
          proposedPublicationDate,
        ).flatMap(_.left.toOption).flatten,
      )
    }
  }

  def asRundownPanel(
      content: Seq[PressedContent],
      id: String,
      collectionLastUpdated: Option[DateTime] = None,
  ): Either[Seq[String], RundownPanel] = {
    // Collect mandatory fields. If any of these is missing we can yield None
    val proposedPanelTitle = {
      content.headOption
        .map { firstTrail =>
          mandatoryPanelTitleFrom(firstTrail)
        }
        .getOrElse(
          Left(Seq("Could not find a first trail to extract panel title from")),
        )
    }

    val proposedRundownArticles =
      makeArticlesFrom(content, 3, "Rundown", MaxRundownArticleTitleLength, MaxOverlineLength)

    val proposedPublicationDate = content
      .flatMap(_.card.webPublicationDateOption)
      .sortBy(_.getMillis)
      .lastOption
      .toRight(Seq("Could not find web publication date for panel"))

    val maybeRundownPanel = for {
      panelTitle <- proposedPanelTitle.toOption
      articles <- proposedRundownArticles.toOption
      // Make a questionable inference of the panels publication and update times from it's trails
      published <- proposedPublicationDate.toOption
      updated = content.flatMap(_.card.lastModifiedOption).sortBy(_.getMillis).lastOption.getOrElse(published)
    } yield {
      // Create a rundown panel
      // Make a questionable inference of the panels publication and update times from it's articles and collection update time
      val updateTimes = articles.map(article => Some(article.updated)) :+ collectionLastUpdated
      val updated = updateTimes.flatten.sortBy(_.getMillis).lastOption.getOrElse(published)
      // to make the rundown panel ID unique when its title is changed, we'll use a hash of the title as part of the ID
      val rundownPanelId = id.concat(s"-${panelTitle.replaceAll(" ", "").toLowerCase.hashCode}")

      RundownPanel(
        guid = rundownPanelId,
        panelTitle = panelTitle,
        articleGroup = ArticleGroup(role = Rundown, articles = articles),
        published = published,
        updated = updated,
      )
    }

    maybeRundownPanel.map(Right(_)).getOrElse {
      // Collect everyone's objections
      val problems =
        Seq(proposedPanelTitle, proposedRundownArticles, proposedPublicationDate).flatMap(_.left.toOption).flatten
      Left(problems)
    }
  }

  private def makeArticlesFrom(
      content: Seq[PressedContent],
      required: Int,
      articleType: String,
      maxTitleLength: Int,
      maxOverlineLength: Int,
  ): Either[Seq[String], Seq[Article]] = {
    val articleOutcomes = content.map { contentItem =>
      // Collect the mandatory fields for the article. If any of these are missing we can skip this item
      val proposedArticleTitle = titleOfLengthFrom(maxTitleLength, contentItem)
      val proposedArticleImage = rundownPanelArticleImageUrlFor(contentItem)
      val proposedOverline = overlineFrom(contentItem, maxOverlineLength)

      val maybeArticle = for {
        webPublicationDate <- contentItem.card.webPublicationDateOption
        title <- proposedArticleTitle.toOption
        guid <- guidFor(contentItem)
        webUrl <- webUrl(contentItem)
        imageUrl <- proposedArticleImage.right.toOption
        maybeOverline <- proposedOverline.toOption
      } yield {
        val lastModified = contentItem.card.lastModifiedOption.getOrElse(webPublicationDate)
        Article(
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

    // We require exactly 3 articles for a valid rundown panel; 2 for a related articles single story panel
    val correctNumberOfArticlesToUse =
      Some(articleOutcomes.flatMap(_.toOption).take(required)).filter(_.size == required)

    correctNumberOfArticlesToUse
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
          Left(Seq(s"$articleType trails need to have all Kickers or all Bylines"))
        }
      }
      .getOrElse {
        val articleProblems = articleOutcomes
          .flatMap(_.left.toOption)
          .flatten
          .flatten
          .flatten
        // Could not make required number of valid articles is the most useful message to the editor so put it first
        Left(s"Could not find $required valid ${articleType.toLowerCase} trails" +: articleProblems)
      }
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

  private def titleOfLengthFrom(length: Int, content: PressedContent): Either[Seq[String], String] = {
    val (_, title) = inferPanelTitleAndTitleFrom(content)
    Right(title)
      .filterOrElse(_.nonEmpty, Seq("Heading is empty"))
      .filterOrElse(_.length <= length, Seq(s"The headline '$title' is longer than " + length + " characters"))
  }

  private def panelTitleFrom(content: PressedContent): Either[Seq[String], Option[String]] = {
    val (maybePanelTitle, _) = inferPanelTitleAndTitleFrom(content)
    maybePanelTitle
      .map { panelTitle =>
        Right(Some(panelTitle))
          .filterOrElse(_ => panelTitle.nonEmpty, Seq(s"Panel title in headline '${content.header.headline}' is empty"))
          .filterOrElse(
            _ => panelTitle.length <= MaxPanelTitleLength,
            Seq(s"The panel title '$panelTitle' is longer than " + MaxPanelTitleLength + " characters"),
          )
      }
      .getOrElse {
        Right(None)
      }
  }

  private def mandatoryPanelTitleFrom(content: PressedContent): Either[Seq[String], String] = {
    val (maybePanelTitle, _) = inferPanelTitleAndTitleFrom(content)
    maybePanelTitle
      .map { panelTitle =>
        Right(panelTitle)
          .filterOrElse(_ => panelTitle.nonEmpty, Seq(s"Panel title in headline '${content.header.headline}' is empty"))
          .filterOrElse(
            _ => panelTitle.length <= MaxPanelTitleLength,
            Seq(s"The panel title '$panelTitle' is longer than " + MaxPanelTitleLength + " characters"),
          )
      }
      .getOrElse {
        Left(Seq(s"Could not find a panel title in the first trail headline '${content.header.headline}'"))
      }
  }

  private def inferPanelTitleAndTitleFrom(content: PressedContent): (Option[String], String) = {
    val trailTitle = TrailsToRss.stripInvalidXMLCharacters(content.header.headline)
    // Look for panel title delimiter
    val pipeDelimited = trailTitle.split(PanelTitleInHeadlineDelimiter).toSeq
    if (pipeDelimited.length == 1) {
      (None, stripHtml(trailTitle))
    } else {
      val left = pipeDelimited.dropRight(1)
      val right = pipeDelimited.last
      (Some(stripHtml(left.mkString(PanelTitleInHeadlineDelimiter.toString))), stripHtml(right))
    }
  }

  private def bylineFrom(content: PressedContent): Option[String] = {
    content.properties.byline.map(stripHtml).filter(_.nonEmpty).filter(_.length <= MaxSinglePanelAuthorLength)
  }

  private def overlineFrom(contentItem: PressedContent, maxLength: Int): Either[Seq[String], Option[String]] = {
    def kickerFrom(content: PressedContent): Option[String] = {
      content.header.kicker.flatMap(_.properties.kickerText).map(stripHtml)
    }
    kickerFrom(contentItem)
      .map { kicker =>
        if (kicker.length <= maxLength) {
          Right(Some(kicker))
        } else {
          Left(Seq(s"Kicker text '$kicker' is longer than $maxLength characters"))
        }
      }
      .getOrElse {
        Right(None)
      }
  }

  private def extractBulletsFrom(trailText: String): Either[Seq[String], BulletList] = {
    val lines = trailText.linesIterator.toSeq

    val proposedBulletTexts = lines
      .map(_.stripLeading)
      .filter { line =>
        line.startsWith(BulletTrailPrefix)
      }
      .map(_.replaceFirst(BulletTrailPrefix, ""))
      .map(stripHtml)

    val validBulletTexts = proposedBulletTexts.filter(_.length <= MaxBulletLength)

    val bulletListItemsToUse =
      validBulletTexts.map(BulletListItem).take(MaxBulletsAllowed) // 3 is the maximum permitted number of bullets

    Right(BulletList(bulletListItemsToUse))
      .filterOrElse(_.listItems.nonEmpty, Seq("Trail text is not formatted as a bullet list"))
      .filterOrElse(_.listItems.size >= 2, Seq("Need at least 2 valid bullet list items"))
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

  private def extractRelatedArticlePanelSummaryFrom(content: PressedContent): Either[Seq[String], Option[String]] = {
    val maybeTrailText = content.card.trailText.map(stripHtml)
    maybeTrailText
      .map { trailText =>
        Right(Some(trailText))
          .filterOrElse(_.nonEmpty, Seq("Trail text is empty"))
          .filterOrElse(
            _ => trailText.length <= MaxRelatedArticlesPanelSummaryLength,
            Seq(
              s"The trail text '$trailText' is longer than the " + MaxPanelTitleLength +
                " characters allowed for a summary",
            ),
          )
      }
      .getOrElse {
        Right(None)
      }
  }

  private def stripHtml(str: String): String = {
    // Could be attached to String as an implicit
    Jsoup.parse(str).text().trim
  }

  private def asString(feed: SyndFeed) = {
    val writer = new StringWriter()
    val output = new SyndFeedOutput()
    output.output(feed, writer)
    writer.close()
    writer.toString
  }

  def asSyndEntry(singleStoryPanel: SingleStoryPanel): SyndEntry = {
    def asGBulletList(bulletList: BulletList) = {
      GBulletList(listItems = bulletList.listItems.map(bullet => GBulletListItem(text = bullet.text)))
    }

    val entry = new SyndEntryImpl()
    entry.setTitle(singleStoryPanel.title)
    entry.setLink(singleStoryPanel.link)
    entry.setUri(singleStoryPanel.guid)
    singleStoryPanel.summary.foreach { summary =>
      val description = new SyndContentImpl
      description.setValue(summary)
      entry.setDescription(description)
    }

    setEntryDates(singleStoryPanel, entry)

    val gModule = new GModule()
    gModule.setPanel(Some(GPanel(singleStoryPanel.`type`, singleStoryPanel.title)))
    gModule.setPanelTitle(singleStoryPanel.panelTitle)
    gModule.setOverline(singleStoryPanel.overline)
    gModule.setBulletList(singleStoryPanel.bulletList.map(asGBulletList))
    gModule.setArticleGroup(singleStoryPanel.articleGroup.map(asGArticleGroup))
    addModuleTo(entry, gModule)

    // and add the showcase formatted asset
    val mediaModule = new MediaEntryModuleImpl()
    mediaModule.setMediaContents(Seq(new MediaContent(new UrlReference(singleStoryPanel.imageUrl))).toArray)
    mediaModule.setMetadata(new Metadata())
    addModuleTo(entry, mediaModule)

    singleStoryPanel.author.foreach { byline =>
      // Sidestep Rome's attempt to follow the RSS spec and only populate the author tag with email addresses
      val bylinePretendingToBePerson = new SyndPersonImpl()
      bylinePretendingToBePerson.setEmail(byline)
      entry.setAuthors(Seq(bylinePretendingToBePerson).asJava)
    }
    entry
  }

  def asSyndEntry(rundownPanel: RundownPanel): SyndEntry = {
    val entry = new SyndEntryImpl
    entry.setUri(rundownPanel.guid)

    setEntryDates(rundownPanel, entry)

    val gModule = new GModule()
    gModule.setPanel(Some(GPanel(rundownPanel.`type`, rundownPanel.panelTitle)))
    gModule.setPanelTitle(Some(rundownPanel.panelTitle))
    gModule.setArticleGroup(Some(asGArticleGroup(rundownPanel.articleGroup)))
    addModuleTo(entry, gModule)
    entry
  }

  private def asGArticleGroup(articleGroup: ArticleGroup): GArticleGroup = {
    def asGArticle(article: Article): GArticle = {
      GArticle(
        article.guid,
        article.title,
        article.link,
        article.published,
        article.updated,
        article.author,
        article.overline,
        article.imageUrl.map(i => new MediaContent(new UrlReference(i))),
      )
    }
    GArticleGroup(role = articleGroup.role, articles = articleGroup.articles.map(asGArticle))
  }

  private def setEntryDates(panel: Panel, entry: SyndEntryImpl): Unit = {
    def atomDatesModuleFor(updated: Option[DateTime]): RssAtomModule = {
      val atomModule = new RssAtomModule
      atomModule.setUpdated(updated)
      atomModule
    }
    // Treatment of publication date differs from the docs;
    // publication date should be placed on the RSS pubDate field; not the atom:published field stated in the docs
    entry.setPublishedDate(panel.published.toDate)
    addModuleTo(entry, atomDatesModuleFor(Some(panel.updated)))
  }

  trait Panel {
    def `type`: String
    def guid: String
    def published: DateTime
    def updated: DateTime
  }

  case class SingleStoryPanel(
      title: String,
      link: String,
      overline: Option[String],
      bulletList: Option[BulletList],
      articleGroup: Option[ArticleGroup],
      imageUrl: String,
      author: Option[String],
      published: DateTime,
      updated: DateTime,
      panelTitle: Option[String],
      summary: Option[String] = None,
  ) extends Panel {
    val `type`: String = SingleStory
    def guid: String = link
  }

  case class RundownPanel(
      guid: String,
      panelTitle: String,
      articleGroup: ArticleGroup,
      published: DateTime,
      updated: DateTime,
  ) extends Panel {
    val `type`: String = Rundown
  }

  case class Article(
      guid: String,
      title: String,
      link: String,
      published: DateTime,
      updated: DateTime,
      author: Option[String],
      overline: Option[String],
      imageUrl: Option[String],
  )

  case class ArticleGroup(role: String, articles: Seq[Article])

  case class BulletList(listItems: Seq[BulletListItem])

  case class BulletListItem(text: String)

}
