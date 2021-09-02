package common

import com.sun.syndication.feed.module.Module
import com.sun.syndication.feed.module.mediarss.MediaEntryModuleImpl
import com.sun.syndication.feed.module.mediarss.io.MediaModuleGenerator
import com.sun.syndication.feed.module.mediarss.types.{MediaContent, Metadata}
import com.sun.syndication.io.ModuleGenerator
import org.jdom.{Attribute, Element, Namespace}
import org.joda.time.DateTime
import org.joda.time.format.ISODateTimeFormat

import java.util
import scala.collection.JavaConverters._

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

  def getBulletList: Option[BulletList]

  def setBulletList(bulletList: Option[BulletList])
}

class GModuleImpl() extends GModule {
  private var panel: Option[String] = None
  private var panelTitle: Option[String] = None
  private var overline: Option[String] = None
  private var articleGroup: Option[ArticleGroup] = None
  private var bulletList: Option[BulletList] = None

  override def getPanel: Option[String] = panel

  override def setPanel(panel: Option[String]): Unit = this.panel = panel

  override def getPanelTitle: Option[String] = panelTitle

  override def setPanelTitle(panelTitle: Option[String]): Unit = this.panelTitle = panelTitle

  override def getOverline: Option[String] = overline

  override def setOverline(overline: Option[String]): Unit = this.overline = overline

  override def getArticleGroup: Option[ArticleGroup] = articleGroup

  override def setArticleGroup(articleGroup: Option[ArticleGroup]): Unit = this.articleGroup = articleGroup

  override def getBulletList: Option[BulletList] = bulletList

  override def setBulletList(bulletList: Option[BulletList]): Unit = this.bulletList = bulletList

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
    setBulletList((source.getBulletList)) // TODO copy
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

case class BulletList(listItems: Seq[BulletListItem])

case class BulletListItem(text: String)

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
          panelElement.setAttribute(new Attribute("type", panel))
          element.addContent(panelElement)
        }
        gModule.getPanelTitle.foreach { panelTitle =>
          val panelTitleElement = new org.jdom.Element("panel_title", NS)
          panelTitleElement.addContent(panelTitle)
          element.addContent(panelTitleElement)
        }
        gModule.getOverline.foreach { overline =>
          val overlineElement = new org.jdom.Element("overline", NS)
          overlineElement.addContent(overline)
          element.addContent(overlineElement)
        }
        gModule.getArticleGroup.foreach { articleGroup =>
          val articleGroupElement = new org.jdom.Element("article_group", NS)
          articleGroup.role.foreach { role =>
            articleGroupElement.setAttribute("role", role)  // TODO yield mandatory field
          }

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

            article.mediaContent.foreach { mediaContent =>
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

        gModule.getBulletList.foreach { bulletList =>
          val bulletListElement = new org.jdom.Element("bullet_list", NS)
          bulletList.listItems.foreach { listItem =>
            val listItemElement = new org.jdom.Element("list_item", NS)
            listItemElement.addContent(listItem.text)
            bulletListElement.addContent(listItemElement)
          }
          element.addContent(bulletListElement)
        }
    }
  }
}
