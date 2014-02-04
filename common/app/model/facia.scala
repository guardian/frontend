package model

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

case class Collection(curated: Seq[Content],
                      editorsPicks: Seq[Content],
                      mostViewed: Seq[Content],
                      results: Seq[Content],
                      displayName: Option[String]) extends implicits.Collections {

  lazy val items: Seq[Trail] = (curated ++ editorsPicks ++ mostViewed ++ results).distinctBy(_.url)
}

object Collection {
  def apply(curated: Seq[Content]): Collection = Collection(curated, Nil, Nil, Nil, None)
  def apply(curated: Seq[Content], displayName: Option[String]): Collection = Collection(curated, Nil, Nil, Nil, displayName)
}

case class FaciaPage(
                   id: String,
                   collections: List[(Config, Collection)])
