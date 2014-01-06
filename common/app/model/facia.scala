package model

case class Config(
                   id: String,
                   contentApiQuery: Option[String] = None,
                   displayName: Option[String] = None,
                   collectionTone: Option[String] = None,
                   href: Option[String] = None)

case class Collection(items: Seq[Trail],
                      displayName: Option[String])

object Collection {
  def apply(items: Seq[Trail]): Collection = Collection(items, None)
  def apply(items: Seq[Trail], name: String): Collection = Collection(items, Some(name))
}

case class FaciaPage(
                   id: String,
                   collections: List[(Config, Collection)])
