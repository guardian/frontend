package model

import org.joda.time.DateTime

case class Config(
                   id: String,
                   contentApiQuery: Option[String] = None,
                   displayName: Option[String] = None,
                   collectionTone: Option[String] = None,
                   href: Option[String] = None,
                   groups: Seq[String],
                   roleName: Option[String])

object Config {
  def apply(id: String): Config = Config(id, None, None, None, None, Nil, None)
  def apply(id: String, contentApiQuery: Option[String], displayName: Option[String], collectionTone: Option[String]): Config
    = Config(id, contentApiQuery, displayName, collectionTone, None, Nil, None)
  def apply (id: String, displayName: Option[String]): Config
  = Config(id, None, displayName, None, None, Nil, None)
}

case class Collection(curated: Seq[Trail],
                      editorsPicks: Seq[Trail],
                      mostViewed: Seq[Trail],
                      results: Seq[Trail],
                      displayName: Option[String],
                      lastUpdated: String,
                      updatedBy: String,
                      updatedEmail: String) extends implicits.Collections {

  lazy val items: Seq[Trail] = (curated ++ editorsPicks ++ mostViewed ++ results).distinctBy(_.url)
}

object Collection {
  def apply(curated: Seq[Trail]): Collection = Collection(curated, Nil, Nil, Nil, None, DateTime.now.toString, "", "")
  def apply(curated: Seq[Trail], displayName: Option[String]): Collection = Collection(curated, Nil, Nil, Nil, displayName, DateTime.now.toString, "", "")
}

case class FaciaPage(
                   id: String,
                   collections: List[(Config, Collection)])
