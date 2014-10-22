package controllers

import common.{ExecutionContexts, Logging}
import play.api.mvc.{Action, Controller}
import thumbnails.ContainerThumbnails

object ThumbnailController extends Controller with Logging with ExecutionContexts {
  def container(id: String) = Action {
    ContainerThumbnails.fromId(id) match {
      case Some(thumbnail) =>
        Ok(thumbnail).as("image/svg+xml")

      case None => NotFound
    }
  }
}
