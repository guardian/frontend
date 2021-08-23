package common

import com.sun.syndication.feed.module.Module
import com.sun.syndication.feed.module.mediarss.types.{MediaContent, Metadata, UrlReference}
import com.sun.syndication.feed.module.mediarss.{MediaEntryModuleImpl, MediaModule}
import com.sun.syndication.feed.synd.{SyndEntry, SyndEntryImpl}
import com.sun.syndication.io.ModuleGenerator
import model.ImageMedia
import model.pressed.{PressedContent, PressedTrail}
import org.jdom.{Element, Namespace}
import org.joda.time.DateTime
import org.joda.time.format.ISODateTimeFormat
import play.api.mvc.RequestHeader

import java.util
import java.util.regex.Pattern
import scala.collection.JavaConverters._

object TrailsToShowcase {

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
    val entries = if (rundownStories.nonEmpty) {
      singleStories.map(asSingleStoryPanel) :+ asRundownPanel(rundownContainerTitle, rundownStories, rundownContainerId)
    } else {
      singleStories.map(asSingleStoryPanel)
    }

    feed.setEntries(entries.asJava)
    TrailsToRss.asString(feed)
  }

  def asSingleStoryPanel(content: PressedContent): SyndEntry = {
    val entry = new SyndEntryImpl()
    entry.setLink(webUrl(content))
    entry.setTitle(stripInvalidXMLCharacters(content.header.headline))
    content.properties.byline.foreach { byline =>
      if (byline.nonEmpty) {
        entry.setAuthor(byline)
      }
    }

    val gModule = new GModuleImpl();
    gModule.setPanel(Some("SINGLE_STORY"))
    gModule.setOverline(content.header.kicker.flatMap(_.properties.kickerText))
    addModuleTo(entry, gModule)

    val withoutMedia = entry.getModules.asScala.filter { module =>
      module.asInstanceOf[Module].getUri != MediaModule.URI
    }
    entry.setModules(withoutMedia.asJava)

    // and add the showcase formatted asset
    mediaContentFrom(content).foreach { mediaContent =>
      val mediaModule = new MediaEntryModuleImpl()
      mediaModule.setMediaContents(Seq(mediaContent).toArray)
      mediaModule.setMetadata(new Metadata())
      addModuleTo(entry, mediaModule)
    }

    // Showcase expects the publication dates to be shown as atom module fields.
    // TODO probably duplicated with rundown items
    val atomModule = new RssAtomModuleImpl
    atomModule.setPublished(content.card.webPublicationDateOption)
    atomModule.setUpdated(
      Seq(content.card.lastModifiedOption, content.card.webPublicationDateOption).flatten.headOption,
    )
    addModuleTo(entry, atomModule)
    entry
  }

  def asRundownPanel(title: String, content: Seq[PressedContent], id: String): SyndEntry = {
    val entry = new SyndEntryImpl
    entry.setUri(id)
    val gModule = new GModuleImpl();
    gModule.setPanel(Some("RUNDOWN"))
    gModule.setPanelTitle(Some(title))

    // Take the trail picture from the first available from our link trails. TODO this needs to be an editor's choice
    content.flatMap(mediaContentFrom).headOption.foreach { mediaContent =>
      val mediaModule = new MediaEntryModuleImpl()
      mediaModule.setMediaContents(Seq(mediaContent).toArray)
      mediaModule.setMetadata(new Metadata())
      addModuleTo(entry, mediaModule)
    }

    // Build article group
    val articles = content.map { contentItem =>
      val webPublicationDate: DateTime = contentItem.card.webPublicationDateOption.get //TODO naked get
      val lastModified: DateTime = contentItem.card.lastModifiedOption.getOrElse(webPublicationDate)
      GArticle(
        guidFor(contentItem),
        stripInvalidXMLCharacters(contentItem.header.headline),
        webUrl(contentItem),
        webPublicationDate,
        lastModified,
        contentItem.header.kicker.flatMap(_.properties.kickerText),
        None,
      )
    }
    val articleGroup = ArticleGroup(role = Some("RUNDOWN"), articles)
    gModule.setArticleGroup(Some(articleGroup))

    addModuleTo(entry, gModule)
    entry
  }

  private def addModuleTo(entry: SyndEntry, module: Module): Unit = {
    val modules = entry.getModules
    entry.setModules((modules.asScala ++ Seq(module)).asJava)
  }

  private def mediaContentFrom(content: PressedContent): Option[MediaContent] = {
    content.properties.maybeContent.map(_.trail).flatMap { trail: PressedTrail =>
      trail.trailPicture.flatMap { trailPicture =>
        trailImageCropToUse(trailPicture).map { imageToUse =>
          new MediaContent(new UrlReference(imageToUse))
        }
      }
    }
  }

  private def trailImageCropToUse(trailPicture: ImageMedia): Option[String] = {
    trailPicture.allImages.headOption.flatMap(_.url) // TODO confirm correct pick
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
    overline: Option[String],
    mediaContent: Option[String],
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
