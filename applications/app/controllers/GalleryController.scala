package controllers

import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import play.api.libs.json.{ JsObject, JsArray, JsString, JsBoolean }
import views.support.RenderOtherStatus
import conf.Switches.RelatedContentSwitch
import views.support.{ ImgSrc, GalleryFullscreenImage }

case class GalleryPage(
  gallery: Gallery,
  related: RelatedContent,
  index: Int,
  trail: Boolean)

object GalleryController extends Controller with Logging with ExecutionContexts {

  def renderJson(path: String) = render(path)
  def render(path: String) = Action.async { implicit request =>
    val index = request.getQueryString("index") map (_.toInt) getOrElse 1
    val isTrail = request.getQueryString("trail") map (_.toBoolean) getOrElse false

    lookup(path, index, isTrail) map {
      case Left(model) if model.gallery.isExpired => RenderOtherStatus(Gone) // TODO - delete this line after switching to new content api
      case Left(model) => renderGallery(model)
      case Right(other) => RenderOtherStatus(other)
    }
  }

  def lightboxJson(path: String) = Action.async { implicit request =>
    val index = request.getQueryString("index") map (_.toInt) getOrElse 1
    lookup(path, index, isTrail=false) map {
      case Right(other) => RenderOtherStatus(other)
      case Left(model) => {
        val imageContainers = model.gallery.galleryImages.filter(_.isGallery)
        val imageJson = imageContainers.map{ imgContainer =>
          imgContainer.largestImage.map { img =>
            JsObject(Seq(
              "caption" -> JsString(img.caption.getOrElse("")),
              "credit" -> JsString(img.credit.getOrElse("")),
              "displayCredit" -> JsBoolean(img.displayCredit),
              "src" -> JsString(ImgSrc.imager(imgContainer, GalleryFullscreenImage).getOrElse(""))
            ))
          }
        }
        Cached(60) {
          JsonComponent(JsObject(Seq(
              "gallery" -> JsObject(Seq(
                  "headline" -> JsString(model.gallery.headline),
                  "shouldHideAdverts" -> JsBoolean(model.gallery.shouldHideAdverts),
                  "standfirst" -> JsString(model.gallery.standfirst.getOrElse("")),
                  "images" -> JsArray(imageJson.flatten)
              ))
          )))
        }
      }
    }
  }

  def renderLightbox(path: String) = Action.async { implicit request =>
    val index = request.getQueryString("index") map (_.toInt) getOrElse 1
    val isTrail = request.getQueryString("trail") map (_.toBoolean) getOrElse false

    lookup(path, index, isTrail) map {
      case Left(model) if model.gallery.isExpired => RenderOtherStatus(Gone) // TODO - delete this line after switching to new content api
      case Left(model) => renderLightboxGallery(model)
      case Right(other) => RenderOtherStatus(other)
    }
  }

  private def lookup(path: String, index: Int, isTrail: Boolean)(implicit request: RequestHeader) =  {
    val edition = Edition(request)
    log.info(s"Fetching gallery: $path for edition $edition")
    LiveContentApi.item(path, edition)
      .showExpired(true)
      .showRelated(InlineRelatedContentSwitch.isSwitchedOn)
      .showFields("all")
      .response.map{response =>
        val gallery = response.content.filter { _.isGallery } map { Gallery(_) }
        val model = gallery map { g => GalleryPage(g, RelatedContent(g, response), index, isTrail) }
        ModelOrResult(model, response)
    }.recover{convertApiExceptions}
  }

  private def renderGallery(model: GalleryPage)(implicit request: RequestHeader) = {
    val htmlResponse = () => views.html.gallery(model.gallery, model.related, model.index)
    val jsonResponse = () => views.html.fragments.galleryBody(model.gallery, model.related, model.index)
    renderFormat(htmlResponse, jsonResponse, model.gallery, Switches.all)
  }

  private def renderLightboxGallery(model: GalleryPage)(implicit request: RequestHeader) = {
    val response = () => views.html.fragments.lightboxGalleryBody(model.gallery, model.index)
    renderFormat(response, response, model.gallery, Switches.all)
  }
}
