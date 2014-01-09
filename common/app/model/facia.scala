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

case class Collection(items: Seq[Trail],
                      displayName: Option[String])

object Collection {
  def apply(items: Seq[Trail]): Collection = Collection(items, None)
  def apply(items: Seq[Trail], name: String): Collection = Collection(items, Some(name))
}

case class FaciaPage(
                   id: String,
                   collections: List[(Config, Collection)])
