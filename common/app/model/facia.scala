package model

case class Config(
                   id: String,
                   contentApiQuery: Option[String],
                   displayName: Option[String],
                   collectionTone: Option[String],
                   groups: Seq[String],
                   roleName: Option[String]) {
  // 'middle' part of the id is the section
  val section: String = id.split("/").tail.dropRight(1).mkString("/")
}

object Config {
  def apply(id: String): Config = Config(id, None, None, None, Nil, None)
  def apply (id: String, contentApiQuery: Option[String], displayName: Option[String], collectionTone: Option[String]): Config
    = Config(id, contentApiQuery, displayName, collectionTone, Nil, None)
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
