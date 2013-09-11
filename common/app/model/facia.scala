package model

import views.support.Style

case class Config(
                   id: String,
                   name: String)

case class Collection(items: Seq[Trail])

case class FaciaPage(
                   id: String,
                   collections: List[(Config, Collection)])
