package model.dotcomrendering.pageElements

import play.api.libs.json._

sealed trait Role
case object Inline extends Role
case object Supporting extends Role
case object Showcase extends Role
case object Immersive extends Role
case object Thumbnail extends Role
case object HalfWidth extends Role

object Role {

  def apply(maybeName: Option[String]): Role = maybeName match {
    case Some("inline") => Inline
    case Some("supporting") => Supporting
    case Some("showcase") => Showcase
    case Some("immersive") => Immersive
    case Some("thumbnail") => Thumbnail
    case Some("halfWidth") => HalfWidth
    case _ => Inline
  }

  def apply(maybeName: Option[String], defaultRole: Role): Role = maybeName match {
    case Some("inline") => Inline
    case Some("supporting") => Supporting
    case Some("showcase") => Showcase
    case Some("immersive") => Immersive
    case Some("thumbnail") => Thumbnail
    case Some("halfWidth") => HalfWidth
    case _ => defaultRole
  }

  implicit object RoleWrites extends Writes[Role] {
    override def writes(r: Role): JsValue = r match {
      case Inline => JsString("inline")
      case Supporting => JsString("supporting")
      case Showcase => JsString("showcase")
      case Immersive => JsString("immersive")
      case Thumbnail => JsString("thumbnail")
      case HalfWidth => JsString("halfWidth")
    }
  }
}



