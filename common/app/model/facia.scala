package model

case class Config(
                   id: String,
                   contentApiQuery: Option[String],
                   displayName: Option[String],
                   collectionType: Option[String]) {
  // 'middle' part of the id is the section
  val section: String = id.split("/").tail.dropRight(1).mkString("/")
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
