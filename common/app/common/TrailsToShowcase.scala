package common

import com.sun.syndication.feed.module.Module
import com.sun.syndication.feed.synd.{SyndEntry, SyndEntryImpl}
import com.sun.syndication.io.ModuleGenerator
import model.Trail
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
      singleStories: Seq[Trail],
      rundownStories: Seq[Trail],
      rundownContainerTitle: String,
      rundownContainerId: String,
      url: Option[String] = None,
      description: Option[String] = None,
  )(implicit request: RequestHeader): String = {
    val feed = TrailsToRss.syndFeedOf(feedTitle, Seq.empty, url, description)
    val entries =
      singleStories.map(asSingleStoryPanel) :+ asRundownPanel(rundownContainerTitle, rundownStories, rundownContainerId)
    feed.setEntries(entries.asJava)
    TrailsToRss.asString(feed)
  }

  def asSingleStoryPanel(trail: Trail): SyndEntry = {
    val entry = TrailsToRss.asEntry(trail)

    val gModule = new GModuleImpl();
    gModule.setPanel(Some("SINGLE_STORY"))
    addModuleTo(entry, gModule)

    val atomModule = new RssAtomModuleImpl
    atomModule.setPublished(Some(trail.webPublicationDate))
    atomModule.setUpdated(Some(trail.fields.lastModified))
    addModuleTo(entry, atomModule)
    entry
  }

  def asRundownPanel(title: String, trails: Seq[Trail], id: String): SyndEntry = {
    val entry = new SyndEntryImpl
    entry.setUri(id)
    val gModule = new GModuleImpl();
    gModule.setPanel(Some("RUNDOWN"))
    gModule.setPanelTitle(Some(title))

    // Build article group
    val articles = trails.map { trail =>
      GArticle(
        guidFor(trail),
        stripInvalidXMLCharacters(trail.fields.linkText),
        trail.metadata.webUrl,
        trail.webPublicationDate,
        trail.fields.lastModified,
        None,
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

  private def guidFor(trail: Trail): String = "http://www.theguardian.com/" + trail.metadata.id // TODO deduplicate

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
  private val NS = Namespace.getNamespace("atom", RssAtomModule.URI)

  override def getNamespaceUri: String = RssAtomModule.URI

  override def getNamespaces: util.Set[_] = Set(NS).asJava

  override def generate(module: Module, element: Element): Unit = {
    module match {
      case rssAtomModule: RssAtomModule => {
        rssAtomModule.getPublished.foreach { published =>
          val publishedElement = new org.jdom.Element("published", NS)
          publishedElement.addContent(ISODateTimeFormat.dateTimeNoMillis().print(published))
          element.addContent(publishedElement)
        }
        rssAtomModule.getUpdated.foreach { updated =>
          val publishedElement = new org.jdom.Element("updated", NS)
          publishedElement.addContent(ISODateTimeFormat.dateTimeNoMillis().print(updated))
          element.addContent(publishedElement)
        }
      }
    }
  }
}

class GModuleGenerator extends ModuleGenerator {
  private val NS = Namespace.getNamespace("g", GModule.URI)
  private val RSS_ATOM_NS = Namespace.getNamespace("atom", RssAtomModule.URI) // TOOD deduplicate

  private val rssAtomModuleGenerator = new RssAtomModuleGenerator()

  override def getNamespaceUri: String = GModule.URI

  override def getNamespaces: util.Set[_] = Set(NS, RSS_ATOM_NS).asJava

  override def generate(module: Module, element: Element): Unit = {
    module match {
      case gModule: GModule => {
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
}
