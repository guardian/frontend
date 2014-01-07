package model

case class Config(
                   id: String,
                   contentApiQuery: Option[String] = None,
                   displayName: Option[String] = None,
                   collectionTone: Option[String] = None,
                   href: Option[String] = None)

case class Collection(curated: Seq[Trail],
                      editorsPicks: Seq[Trail],
                      results: Seq[Trail],
                      displayName: Option[String]) {

  def items: Seq[Trail] = curated ++ editorsPicks.filterNot(ep => curated.exists(_.url == ep.url)) ++ results.filterNot (r => curated.exists(_.url == r.url))
}

object Collection {
  def apply(curated: Seq[Trail], displayName: Option[String]): Collection = Collection(curated, Nil, Nil, displayName)
}

case class FaciaPage(
                   id: String,
                   collections: List[(Config, Collection)])
