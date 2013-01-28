package model

import org.joda.time.DateTime

case class Parent(id: String, title: Option[String] = None)
case class AttachedContent(id: String, importance: Int)

case class Event(
  id: String,
  startDate: DateTime,
  title: String,
  importance: Option[Int] = None,
  content: Seq[AttachedContent] = Nil,
  parent: Option[Parent] = None,
  ancestor: Option[Parent] = None)