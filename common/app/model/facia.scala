package model

case class Config(
                   id: String,
                   contentApiQuery: Option[String] = None,
                   displayName: Option[String] = None,
                   collectionTone: Option[String] = None,
                   href: Option[String] = None)

case class Collection(curated: Seq[Trail],
                      editorsPicks: Seq[Trail],
                      mostViewed: Seq[Trail],
                      results: Seq[Trail],
                      displayName: Option[String]) extends implicits.Collections {

  lazy val items: Seq[Trail] = (curated ++ editorsPicks ++ mostViewed ++ results).distinctBy(_.url)
}

object Collection {
  def apply(curated: Seq[Trail]): Collection = Collection(curated, Nil, Nil, Nil, None)
  def apply(curated: Seq[Trail], displayName: Option[String]): Collection = Collection(curated, Nil, Nil, Nil, displayName)
}

case class FaciaPage(
                   id: String,
                   collections: List[(Config, Collection)])
