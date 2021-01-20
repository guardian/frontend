package model.pressed

import com.gu.facia.api.{utils => fapiutils}

sealed trait MediaType

case object Gallery extends MediaType
case object Video extends MediaType
case object Audio extends MediaType

object MediaType {
  def make(mediaType: fapiutils.MediaType): MediaType =
    mediaType match {
      case fapiutils.Video   => Video
      case fapiutils.Gallery => Gallery
      case fapiutils.Audio   => Audio
    }
}
