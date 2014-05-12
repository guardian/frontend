package model

import org.joda.time.DateTime
import common.Edition

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

object SeoData {
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
  def webTitleFromSecondChunk(chunk: String): String = chunk.split('-').map(_.capitalize).mkString(" ")

  def titleFromWebTitle(webTitle: String): String = s"$webTitle news, comment and analysis from the Guardian"
  def descriptionFromWebTitle(webTitle: String): Option[String] = Option(s"Latest $webTitle news, comment and analysis from the Guardian, the world's leading liberal voice")
}

object FaciaComponentName {
  def apply(config: Config, collection: Collection): String = {
    config.displayName.orElse(collection.displayName).map { title =>
      title.toLowerCase.replace(" ", "-")
    }.getOrElse("no-name")
  }
}
