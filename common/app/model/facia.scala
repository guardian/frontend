package model

import views.support.Style

case class Config(
                   id: String,
                   name: String,
                   numItemsVisible: Int,
                   style: Option[Style],
                   section: String,
                   showMore: Boolean,
                   isConfigured: Boolean)

case class Items(items: Seq[Trail])

case class FaciaTrailblock(
                            id: String,
                            collections: List[(Config, Items)])