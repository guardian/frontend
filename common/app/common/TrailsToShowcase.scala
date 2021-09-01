package common

import com.sun.syndication.feed.module.Module
import com.sun.syndication.feed.module.mediarss.MediaEntryModuleImpl
import com.sun.syndication.feed.module.mediarss.types.{MediaContent, Metadata, UrlReference}
import com.sun.syndication.feed.synd.{SyndEntry, SyndEntryImpl}
import model.ImageAsset
import model.pressed.{PressedContent, PressedTrail, Replace}
import play.api.mvc.RequestHeader

import java.util.regex.Pattern
import scala.collection.JavaConverters._

object TrailsToShowcase {

  private val Rundown = "RUNDOWN"
  private val SingleStory = "SINGLE_STORY"

  private val MaxLengthForSinglePanelTitle = 86
  private val MaxLengthForSinglePanelAuthor = 42
  private val MaxOverlineLength = 30

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
    val feed = TrailsToRss.syndFeedOf(feedTitle, Seq.empty, url, description)

    val entries = (singleStories
      .map(asSingleStoryPanel) :+ asRundownPanel(rundownContainerTitle, rundownStories, rundownContainerId)).flatten

    feed.setEntries(entries.asJava)
    TrailsToRss.asString(feed)
  }

  def asSingleStoryPanel(content: PressedContent): Option[SyndEntry] = {
    val entry = new SyndEntryImpl()
    entry.setLink(webUrl(content))

    for {
      // Collect all mandatory values; any missing will result in a None entry
      title <- Some(stripInvalidXMLCharacters(content.header.headline)).filter(_.length <= MaxLengthForSinglePanelTitle)
      imageUrl <- singleStoryImageUrlFor(content)

    } yield {
      entry.setTitle(title)

      val gModule = new GModuleImpl();
      gModule.setPanel(Some(SingleStory))
      gModule.setOverline(kickerFrom(content))
      addModuleTo(entry, gModule)

      // and add the showcase formatted asset
      val mediaModule = new MediaEntryModuleImpl()
      mediaModule.setMediaContents(Seq(new MediaContent(new UrlReference(imageUrl))).toArray)
      mediaModule.setMetadata(new Metadata())
      addModuleTo(entry, mediaModule)

      // Showcase expects the publication dates to be shown as atom module fields.
      // TODO probably duplicated with rundown items
      val atomModule = new RssAtomModuleImpl
      atomModule.setPublished(content.card.webPublicationDateOption)
      atomModule.setUpdated(
        Seq(content.card.lastModifiedOption, content.card.webPublicationDateOption).flatten.headOption,
      )
      addModuleTo(entry, atomModule)

      // Set optional fields
      bylineFrom(content).foreach { byline =>
        entry.setAuthor(byline)
      }
      entry
    }
  }

  def asRundownPanel(title: String, content: Seq[PressedContent], id: String): Option[SyndEntry] = {
    def makeArticlesFrom(content: Seq[PressedContent]): Option[Seq[GArticle]] = {
      val validArticles = content.flatMap { contentItem =>
        // Collect the mandatory fields for the article. If any of these are missing we can skip this item
        for {
          webPublicationDate <- contentItem.card.webPublicationDateOption
          title <- Some(stripInvalidXMLCharacters(contentItem.header.headline))
            .filter(_.nonEmpty)
            .filter(_.length <= MaxLengthForRundownPanelArticleTitle)
          imageUrl <- rundownPanelArticleImageUrlFor(contentItem)
        } yield {
          val lastModified = contentItem.card.lastModifiedOption.getOrElse(webPublicationDate)
          GArticle(
            guidFor(contentItem),
            title,
            webUrl(contentItem),
            webPublicationDate,
            lastModified,
            bylineFrom(contentItem),
            kickerFrom(contentItem),
            Some(new MediaContent(new UrlReference(imageUrl))),
          )
        }
      }
      // We require exactly 3 articles for a valid rundown panel
      val threeArticlesToUse = Some(validArticles.take(3)).filter(_.size == 3)

      // Ensure author and kickers are consistent with validation rules
      // If an author is used on any article it must be used on all of them
      // If a kicker is used on any article it must be used on all of them
      // You cannot mix authors and kickers
      threeArticlesToUse.map { articles =>
        // Most of our content has bylines. Kicker is an optional override in our tools
        // Therefore we should default to using author tags if it is available on all the articles.
        // If kickers have been supplied for all articles we will use that in preference to authors
        val allAuthorsPresent = articles.forall(_.author.nonEmpty)
        val allKickersPresent = articles.forall(_.overline.nonEmpty)

        if (allKickersPresent) {
          // Use kickers; remove any authors
          articles.map(_.copy(author = None))
        } else if (allAuthorsPresent) {
          // Use authors; remove any kickers
          articles.map(_.copy(overline = None))
        } else {
          // Use neither
          articles.map(_.copy(author = None, overline = None))
        }
      }
    }

    // Collect mandatory fields. If any of these is missing we can yield None
    for {
      title <- Some(title).filter(_.nonEmpty).filter(_.length <= MaxLengthForRundownPanelTitle)
      articles <- makeArticlesFrom(content)
    } yield {
      val entry = new SyndEntryImpl
      entry.setUri(id)

      val gModule = new GModuleImpl();
      gModule.setPanel(Some(Rundown))
      gModule.setPanelTitle(Some(title))
      gModule.setArticleGroup(Some(ArticleGroup(role = Some(Rundown), articles)))
      addModuleTo(entry, gModule)
      entry
    }
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
        case replace: Replace => {
          val empty = Map(
            "width" -> replace.imageSrcWidth,
            "height" -> replace.imageSrcHeight,
          )
          Some(
            ImageAsset(url = Some(replace.imageSrc), mimeType = None, mediaType = "", fields = empty),
          ) // TODO incomplete mapping
        }
        case _ => None
      }

    val contentTrailImageAsset = content.properties.maybeContent.map(_.trail).flatMap { trail: PressedTrail =>
      trail.trailPicture.flatMap { imageMedia =>
        imageMedia.largestImage
      }
    }

    // Of the available image assets take the first which is large enough and has a url
    Seq(replacementImageAsset, contentTrailImageAsset).flatten.filter(imageSizeFilter).flatMap(_.url).headOption
  }

  private def guidFor(content: PressedContent): String = webUrl(content)

  private def webUrl(content: PressedContent): String =
    "https://www.theguardian.com" + content.header.url // TODO duplicate with RSS

  private def bylineFrom(content: PressedContent): Option[String] = {
    content.properties.byline.filter(_.nonEmpty).filter(_.length <= MaxLengthForSinglePanelAuthor)
  }

  private def kickerFrom(content: PressedContent): Option[String] = {
    content.header.kicker.flatMap(_.properties.kickerText).filter(_.length <= MaxOverlineLength)
  }

  // TODO duplication
  val pattern = Pattern.compile("[^\\x09\\x0A\\x0D\\x20-\\uD7FF\\uE000-\\uFFFD\\u10000-\\u10FFFF]")
  private def stripInvalidXMLCharacters(s: String) = {
    pattern.matcher(s).replaceAll("")
  }

}
