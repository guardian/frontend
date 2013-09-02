package model

import views.support.Style

case class Config(
                   id: String,
                   name: String,
                   numItemsVisible: Int,
                   style: Option[Style],
                   section: String,
                   showMore: Boolean)

case class Collection(items: Seq[Trail])

case class FaciaPage(
                   id: String,
                   collections: List[(Config, Collection)])