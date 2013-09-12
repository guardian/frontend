package model

import views.support.Style

case class Config(
                   id: String,
                   name: String) {
  // 'middle' part of the id is the section
  val section: String = id.split("/").tail.dropRight(1).mkString("/")
}

case class Collection(items: Seq[Trail])

case class FaciaPage(
                   id: String,
                   collections: List[(Config, Collection)])
