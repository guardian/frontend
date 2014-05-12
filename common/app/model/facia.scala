package model

import org.joda.time.DateTime
import common.{ExecutionContexts, Edition}
import scala.concurrent.Future
import com.gu.openplatform.contentapi.model.ItemResponse
import conf.ContentApi
import services.ConfigAgent

case class Config(
                   id: String,
                   contentApiQuery: Option[String] = None,
                   displayName: Option[String] = None,
                   href: Option[String] = None,
                   groups: Seq[String],
                   collectionType: Option[String],
                   showTags: Boolean = false,
                   showSections: Boolean = false
                   )

object Config {
  def apply(id: String): Config = Config(id, None, None, None, Nil, None)
  def apply(id: String, contentApiQuery: Option[String], displayName: Option[String], `type`: Option[String]): Config
    = Config(id, contentApiQuery, displayName, `type`, Nil, None)
  def apply (id: String, displayName: Option[String]): Config
    = Config(id, None, displayName, None, Nil, None)
  def apply (id: String, displayName: Option[String], href: Option[String]): Config
    = Config(id, None, displayName, href, Nil, None)

  val emptyConfig = Config("")
}

case class Collection(curated: Seq[Content],
                      editorsPicks: Seq[Content],
                      mostViewed: Seq[Content],
                      results: Seq[Content],
                      displayName: Option[String],
                      href: Option[String],
                      lastUpdated: Option[String],
                      updatedBy: Option[String],
                      updatedEmail: Option[String]) extends implicits.Collections {

  lazy val items: Seq[Content] = (curated ++ editorsPicks ++ mostViewed ++ results).distinctBy(_.url)
}

object Collection {
  def apply(curated: Seq[Content]): Collection = Collection(curated, Nil, Nil, Nil, None, None, Option(DateTime.now.toString), None, None)
  def apply(curated: Seq[Content], displayName: Option[String]): Collection = Collection(curated, Nil, Nil, Nil, displayName, None, Option(DateTime.now.toString), None, None)
}
case class SeoDataJson(
  id: String,
  section: Option[String],
  webTitle: Option[String],   //Always short, eg, "Reviews" for "tone/reviews" id
  title: Option[String],      //Long custom title entered by editors
  description: Option[String])

case class SeoData(
  id: String,
  section: String,
  webTitle: String,
  title: String,
  description: Option[String])

object SeoData extends ExecutionContexts {
  val editions = Edition.all.map(_.id).map(_.toLowerCase)

  def fromPath(path: String): SeoData = path.split('/').toList match {
    //This case is only to handle the nonevent of uk/technology/games
    case edition :: section :: name :: tail if editions.contains(edition.toLowerCase) =>
      val webTitle: String = webTitleFromTail(name :: tail)
      SeoData(path, section, webTitle, titleFromWebTitle(webTitle), descriptionFromWebTitle(webTitle))
    case edition :: name :: tail if editions.contains(edition.toLowerCase) =>
      val webTitle: String = webTitleFromTail(name :: tail)
      SeoData(path, name, webTitle, titleFromWebTitle(webTitle), descriptionFromWebTitle(webTitle))
    case section :: name :: tail =>
      val webTitle: String = webTitleFromTail(name :: tail)
      SeoData(path, section, webTitle, titleFromWebTitle(webTitle), descriptionFromWebTitle(webTitle))
    case oneWord :: tail =>
      val capitalOneWorld: String = oneWord.capitalize
      SeoData(path, oneWord, capitalOneWorld, titleFromWebTitle(capitalOneWorld), descriptionFromWebTitle(capitalOneWorld))
  }

  def webTitleFromTail(tail: List[String]): String = tail.flatMap(_.split('-')).flatMap(_.split('/')).map(_.capitalize).mkString(" ")

  def titleFromWebTitle(webTitle: String): String = s"$webTitle news, comment and analysis from the Guardian"
  def descriptionFromWebTitle(webTitle: String): Option[String] = Option(s"Latest $webTitle news, comment and analysis from the Guardian, the world's leading liberal voice")

  def getSeoData(path: String): Future[SeoData] = {
    val seoDataFromConfig:   Future[SeoDataJson] = Future.successful(ConfigAgent.getSeoDataJsonFromConfig(path))
    val itemResponseForPath: Future[Option[ItemResponse]] = getSectionOrTagWebTitle(path)
    val seoDataFromPath:     Future[SeoData] = Future.successful(SeoData.fromPath(path))

    for {
      sc <- seoDataFromConfig
      ir <- itemResponseForPath
      sp <- seoDataFromPath
    } yield {
      val section:  String = sc.section.orElse(ir.flatMap(getSectionFromItemResponse)).getOrElse(sp.section)
      val webTitle: String = sc.webTitle.orElse(ir.flatMap(getWebTitleFromItemResponse)).getOrElse(sp.webTitle)
      val title: String    = sc.title.getOrElse(SeoData.titleFromWebTitle(webTitle))
      val description: Option[String] = sc.description.orElse(SeoData.descriptionFromWebTitle(webTitle))

      SeoData(path, section, webTitle, title, description)
    }
  }

  private def getSectionFromItemResponse(itemResponse: ItemResponse): Option[String] =
    itemResponse.tag.flatMap(_.sectionId)
      .orElse(itemResponse.section.map(_.id).map(removeLeadEditionFromSectionId))

  private def getWebTitleFromItemResponse(itemResponse: ItemResponse): Option[String] =
    itemResponse.tag.map(_.webTitle)
      .orElse(itemResponse.section.map(_.webTitle))

  //This will turn au/culture into culture. We want to stay consistent with the manual entry and autogeneration
  private def removeLeadEditionFromSectionId(sectionId: String): String = sectionId.split('/').toList match {
    case edition :: tail if Edition.all.map(_.id.toLowerCase).contains(edition.toLowerCase) => tail.mkString("/")
    case _ => sectionId
  }

  private def getSectionOrTagWebTitle(id: String): Future[Option[ItemResponse]] =
    ContentApi
      .item(id, Edition.defaultEdition)
      .showEditorsPicks(false)
      .pageSize(0)
      .response
      .map(Option.apply)
      .fallbackTo(Future.successful(None))
}

object FaciaComponentName {
  def apply(config: Config, collection: Collection): String = {
    config.displayName.orElse(collection.displayName).map { title =>
      title.toLowerCase.replace(" ", "-")
    }.getOrElse("no-name")
  }
}
