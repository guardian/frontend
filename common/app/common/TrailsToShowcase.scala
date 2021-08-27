package common

import com.sun.syndication.feed.module.Module
import com.sun.syndication.feed.module.mediarss.MediaEntryModuleImpl
import com.sun.syndication.feed.module.mediarss.io.MediaModuleGenerator
import com.sun.syndication.feed.module.mediarss.types.{MediaContent, Metadata, UrlReference}
import com.sun.syndication.feed.synd.{SyndEntry, SyndEntryImpl}
import com.sun.syndication.io.ModuleGenerator
import model.pressed.{PressedContent, PressedTrail}
import model.{ImageAsset, ImageMedia}
import org.jdom.{Element, Namespace}
import org.joda.time.DateTime
import org.joda.time.format.ISODateTimeFormat
import play.api.mvc.RequestHeader

import java.util
import java.util.regex.Pattern
import scala.collection.JavaConverters._

object TrailsToShowcase {

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

    val entries = (singleStories.map(asSingleStoryPanel) :+ asRundownPanel(rundownContainerTitle, rundownStories, rundownContainerId)).flatten

    feed.setEntries(entries.asJava)
    TrailsToRss.asString(feed)
  }

  def asSingleStoryPanel(content: PressedContent): Option[SyndEntry] = {
    val entry = new SyndEntryImpl()
    entry.setLink(webUrl(content))

    for {
      // Collect all mandatory values; any missing will result in a None entry
      title <- Some(stripInvalidXMLCharacters(content.header.headline)).filter(_.length <= MaxLengthForSinglePanelTitle)
      mediaContent <- singleStoryMediaContentFrom(content)

    } yield {
      entry.setTitle(title)

      val gModule = new GModuleImpl();
      gModule.setPanel(Some("SINGLE_STORY"))
      gModule.setOverline(kickerFrom(content))
      addModuleTo(entry, gModule)

      // and add the showcase formatted asset
      val mediaModule = new MediaEntryModuleImpl()
      mediaModule.setMediaContents(Seq(mediaContent).toArray)
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
          mediaContent <- rundownPanelArticleMediaContentFrom(contentItem)
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
            Some(mediaContent),
          )
        }
      }
      // We require exactly 3 articles for a valid rundown panel
      Some(validArticles.take(3)).filter(_.size == 3).flatMap { articles =>
        // If an author is used on any article it must be used on all of them
        // If a kicker is used on any article it must be used on all of them
        val authorUsed = articles.exists(_.author.nonEmpty)
        val kickerUsed = articles.exists(_.overline.nonEmpty)

        val withValidKickers = if (kickerUsed && articles.exists(_.overline.isEmpty)) {
          None
        } else {
          Some(articles)
        }

        withValidKickers.flatMap { articles =>
          if (authorUsed && articles.exists(_.author.isEmpty)) {
            None
          } else {
            Some(articles)
          }
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
      gModule.setPanel(Some("RUNDOWN"))
      gModule.setPanelTitle(Some(title))
      gModule.setArticleGroup(Some(ArticleGroup(role = Some("RUNDOWN"), articles)))
      addModuleTo(entry, gModule)
      entry
    }
  }

  private def addModuleTo(entry: SyndEntry, module: Module): Unit = {
    val modules = entry.getModules
    entry.setModules((modules.asScala ++ Seq(module)).asJava)
  }

  private def singleStoryMediaContentFrom(content: PressedContent): Option[MediaContent] = { // TODO Too early to be passing RSS classes
    def cropToUse(imageMedia: ImageMedia): Option[ImageAsset] = {
      imageMedia.largestImage.filter { imageAsset =>
        imageAsset.width >= 640 && imageAsset.height >= 320
      }
    }

    content.properties.maybeContent.map(_.trail).flatMap { trail: PressedTrail =>
      trail.trailPicture.flatMap { imageMedia =>
        cropToUse(imageMedia).flatMap { imageToUse =>
          imageToUse.url.map { url => new MediaContent(new UrlReference(url)) }
        }
      }
    }
  }

  private def rundownPanelArticleMediaContentFrom(content: PressedContent): Option[MediaContent] = { // TODO Too early to be passing RSS classes
    def cropToUse(imageMedia: ImageMedia): Option[ImageAsset] = {
      imageMedia.largestImage.filter { imageAsset =>
        imageAsset.width >= 1200 && imageAsset.height >= 900
      }
    }

    content.properties.maybeContent.map(_.trail).flatMap { trail: PressedTrail =>
      trail.trailPicture.flatMap { imageMedia =>
        cropToUse(imageMedia).flatMap { imageToUse =>
          imageToUse.url.map { url => new MediaContent(new UrlReference(url)) }
        }
      }
    }
  }

  private def guidFor(content: PressedContent): String =
    "http://www.theguardian.com" + content.header.url // As per Trail RSS

  private def webUrl(content: PressedContent): String =
    "https://www.theguardian.com" + content.header.url // TODO duplicate with RSS

  // TODO duplication
  val pattern = Pattern.compile("[^\\x09\\x0A\\x0D\\x20-\\uD7FF\\uE000-\\uFFFD\\u10000-\\u10FFFF]")
  private def stripInvalidXMLCharacters(s: String) = {
    pattern.matcher(s).replaceAll("")
  }

  private def bylineFrom(content: PressedContent): Option[String] = {
    content.properties.byline.filter(_.nonEmpty).filter(_.length <= MaxLengthForSinglePanelAuthor)
  }

  private def kickerFrom(content: PressedContent): Option[String] = {
    content.header.kicker.flatMap(_.properties.kickerText).filter(_.length <= MaxOverlineLength)
  }

}

trait RssAtomModule extends com.sun.syndication.feed.module.Module with Serializable with Cloneable {
  override def getUri: String = RssAtomModule.URI

  def getPublished: Option[DateTime]
  def setPublished(published: Option[DateTime])

  def getUpdated: Option[DateTime]
  def setUpdated(updated: Option[DateTime])
}

class RssAtomModuleImpl extends RssAtomModule {
  private var published: Option[DateTime] = None
  private var updated: Option[DateTime] = None

  override def getPublished: Option[DateTime] = published

  override def setPublished(published: Option[DateTime]): Unit = this.published = published

  override def getUpdated: Option[DateTime] = updated

  override def setUpdated(updated: Option[DateTime]): Unit = this.updated = updated

  override def getInterface: Class[_] = classOf[RssAtomModule]

  override def clone: Object = {
    val module = new RssAtomModuleImpl
    module.copyFrom(this)
    module
  }

  override def copyFrom(obj: Any): Unit = {
    val source = obj.asInstanceOf[RssAtomModule]
    setPublished(source.getPublished)
    setUpdated(source.getUpdated)
  }
}

object RssAtomModule {
  val URI = "http://www.w3.org/2005/Atom"
}

trait GModule extends com.sun.syndication.feed.module.Module with Serializable with Cloneable {
  override def getUri: String = GModule.URI

  def getPanel: Option[String]

  def setPanel(panel: Option[String])

  def getPanelTitle: Option[String]

  def setPanelTitle(panelTitle: Option[String])

  def getOverline: Option[String]

  def setOverline(overline: Option[String])

  def getArticleGroup: Option[ArticleGroup]

  def setArticleGroup(articleGroup: Option[ArticleGroup])
}

class GModuleImpl() extends GModule {
  private var panel: Option[String] = None
  private var panelTitle: Option[String] = None
  private var overline: Option[String] = None
  private var articleGroup: Option[ArticleGroup] = None

  override def getPanel: Option[String] = panel

  override def setPanel(panel: Option[String]): Unit = this.panel = panel

  override def getPanelTitle: Option[String] = panelTitle

  override def setPanelTitle(panelTitle: Option[String]): Unit = this.panelTitle = panelTitle

  override def getOverline: Option[String] = overline

  override def setOverline(overline: Option[String]): Unit = this.overline = overline

  override def getArticleGroup: Option[ArticleGroup] = articleGroup

  override def setArticleGroup(articleGroup: Option[ArticleGroup]): Unit = this.articleGroup = articleGroup

  override def getInterface: Class[_] = classOf[GModule]

  override def clone: Object = {
    val gModule = new GModuleImpl
    gModule.copyFrom(this)
    gModule
  }

  override def copyFrom(obj: Any): Unit = {
    val source = obj.asInstanceOf[GModule]
    setPanel(source.getPanel)
    setPanelTitle(source.getPanelTitle)
    setOverline(source.getOverline)
    setArticleGroup(source.getArticleGroup) // TODO copy
  }

}

object GModule {
  val URI = "http://schemas.google.com/pcn/2020"
}

case class GArticle(
    guid: String,
    title: String,
    link: String,
    published: DateTime,
    updated: DateTime,
    author: Option[String],
    overline: Option[String],
    mediaContent: Option[MediaContent],
)
case class ArticleGroup(role: Option[String], articles: Seq[GArticle])

class RssAtomModuleGenerator extends ModuleGenerator {

  override def getNamespaceUri: String = RssAtomModule.URI

  override def getNamespaces: util.Set[_] = Set(RssAtomModuleGenerator.NS).asJava

  override def generate(module: Module, element: Element): Unit = {
    module match {
      case rssAtomModule: RssAtomModule => {
        rssAtomModule.getPublished.foreach { published =>
          val publishedElement = new org.jdom.Element("published", RssAtomModuleGenerator.NS)
          publishedElement.addContent(ISODateTimeFormat.dateTimeNoMillis().print(published))
          element.addContent(publishedElement)
        }
        rssAtomModule.getUpdated.foreach { updated =>
          val publishedElement = new org.jdom.Element("updated", RssAtomModuleGenerator.NS)
          publishedElement.addContent(ISODateTimeFormat.dateTimeNoMillis().print(updated))
          element.addContent(publishedElement)
        }
      }
    }
  }
}

object RssAtomModuleGenerator {
  val NS: Namespace = Namespace.getNamespace("atom", RssAtomModule.URI)
}

class GModuleGenerator extends ModuleGenerator {
  private val NS = Namespace.getNamespace("g", GModule.URI)
  private val rssAtomModuleGenerator = new RssAtomModuleGenerator()
  private val mediaModuleGenerator = new MediaModuleGenerator()

  override def getNamespaceUri: String = GModule.URI

  override def getNamespaces: util.Set[_] = Set(NS, RssAtomModuleGenerator.NS).asJava

  override def generate(module: Module, element: Element): Unit = {
    module match {
      case gModule: GModule =>
        gModule.getPanel.foreach { panel =>
          val panelElement = new org.jdom.Element("panel", NS)
          panelElement.addContent(panel)
          element.addContent(panelElement)
        }
        gModule.getArticleGroup.foreach { articleGroup =>
          val articleGroupElement = new org.jdom.Element("article_group", NS)
          val roleElement = new org.jdom.Element("role", NS)
          articleGroup.role.foreach { role =>
            roleElement.addContent(role)
          }
          articleGroupElement.addContent(roleElement)

          articleGroup.articles.foreach { article =>
            // Slightly regrettable but limited duplication with the main rss entry generation
            val articleElement = new Element("item")

            val guidElement = new Element("guid")
            guidElement.addContent(article.guid)
            articleElement.addContent(guidElement)

            val titleElement = new Element("title")
            titleElement.addContent(article.title)
            articleElement.addContent(titleElement)

            val linkElement = new Element("link")
            linkElement.addContent(article.link)
            articleElement.addContent(linkElement)

            article.author.foreach { author =>
              val authorElement = new Element("author")
              authorElement.addContent(author)
              articleElement.addContent(authorElement)
            }

            article.mediaContent.map { mediaContent =>
              val mediaModule = new MediaEntryModuleImpl()
              mediaModule.setMediaContents(Seq(mediaContent).toArray)
              mediaModule.setMetadata(new Metadata())
              mediaModuleGenerator.generate(mediaModule, articleElement)
            }

            val rssAtomModule = new RssAtomModuleImpl()
            rssAtomModule.setPublished(Some(article.published))
            rssAtomModule.setUpdated(Some(article.updated))
            rssAtomModuleGenerator.generate(rssAtomModule, articleElement)

            articleGroupElement.addContent(articleElement)
          }

          element.addContent(articleGroupElement)
        }
    }
  }
}
