package model

import views.support.Style

case class Config(
                   id: String,
                   name: String,
                   contentApiQuery: Option[String])

case class Collection(items: Seq[Trail],
                      displayName: Option[String])

object Collection {
  def apply(items: Seq[Trail]): Collection = Collection(items, None)
}

case class FaciaPage(
                   id: String,
                   collections: List[(Config, Collection)])
