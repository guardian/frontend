package services.dotcomponents.pickers

import controllers.ArticlePage
import model.PageWithStoryPackage
import model.liveblog.{BlockElement, ImageBlockElement, TextBlockElement}
import play.api.mvc.RequestHeader
import services.dotcomponents.{LocalRender, RemoteRender, RenderType}
import views.support.Commercial
import implicits.Requests._

object PageChecks {

  // each function should ideally only check a single value

  def isAdFree(page: PageWithStoryPackage, request: RequestHeader): Boolean = {
    page.item.content.shouldHideAdverts || Commercial.isAdFree(request)
  }

  def isDiscussionDisabled(page: PageWithStoryPackage): Boolean = {
    (! page.article.content.trail.isCommentable) && page.article.content.trail.isClosedForComments
  }

  def hasBlocks(page: PageWithStoryPackage): Boolean = {
    page.article.blocks match {
      case Some(b) => b.body.nonEmpty
      case None => false
    }
  }

  def isSupportedType(page: PageWithStoryPackage): Boolean = {
    page match {
      case a:ArticlePage => true
      case _ => false
    }
  }

  def hasOnlySupportedElements(page: PageWithStoryPackage): Boolean = {
    def unsupportedElement(blockElement: BlockElement) = blockElement match {
      case _: TextBlockElement => false
      case _ => true
    }

    !page.article.blocks.exists(_.body.exists(_.elements.exists(unsupportedElement)))
  }

  def isNotImmersive(page: PageWithStoryPackage): Boolean = ! page.item.isImmersive

  def isNotLiveBlog(page:PageWithStoryPackage): Boolean = ! page.item.isLiveBlog

  def isNotAReview(page:PageWithStoryPackage): Boolean = ! page.item.tags.isReview

  def isNotAGallery(page:PageWithStoryPackage): Boolean = ! page.item.tags.isGallery

  def isNotAMP(request: RequestHeader): Boolean = ! request.isAmp

  def isNotOpinion(page:PageWithStoryPackage): Boolean = ! page.item.tags.isComment

}

class SimplePagePicker extends RenderTierPickerStrategy {

  type Check = (PageWithStoryPackage, RequestHeader) => Boolean
  type Results = List[(String, Boolean)]

  def getRenderTierFor(page: PageWithStoryPackage, request: RequestHeader): (Results, RenderType) = {

    val results: Results = List(
      ("isSupportedType", PageChecks.isSupportedType(page)),
      ("hasBlocks", PageChecks.hasBlocks(page)),
      ("hasOnlySupportedElements", PageChecks.hasOnlySupportedElements(page)),
      ("isDiscussionDisabled", PageChecks.isDiscussionDisabled(page)),
      ("isAdFree", PageChecks.isAdFree(page, request)),
      ("isNotImmersive", PageChecks.isNotImmersive(page)),
      ("isNotLiveBlog", PageChecks.isNotLiveBlog(page)),
      ("isNotAReview", PageChecks.isNotAReview(page)),
      ("isNotAGallery", PageChecks.isNotAGallery(page)),
      ("isNotAMP", PageChecks.isNotAMP(request)),
      ("isNotAMP", PageChecks.isNotOpinion(page))
    )

    val success = ! results.exists{!_._2}

    (results, if(success) RemoteRender else LocalRender)

  }

}
