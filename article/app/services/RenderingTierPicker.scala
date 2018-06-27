package services

import common.Logging
import controllers.ArticlePage
import model.PageWithStoryPackage
import model.liveblog.{BodyBlock, ImageBlockElement, TextBlockElement}

sealed trait RenderType
case object RemoteRender extends RenderType
case object LocalRender extends RenderType

object RenderingTierPicker {

  private def isDiscussionDisabled(page: PageWithStoryPackage): Boolean = {
    (! page.article.content.trail.isCommentable) && page.article.content.trail.isClosedForComments
  }

  private def hasBlocks(page: PageWithStoryPackage): Boolean = {
    page.article.blocks match {
      case Some(b) => b.body.nonEmpty
      case None => false
    }
  }

  private def isSupportedType(page: PageWithStoryPackage): Boolean = {
    page match {
      case a:ArticlePage => true
      case _ => false
    }
  }

  private def hasOnlySupportedElements(page: PageWithStoryPackage): Boolean = {

    page.article.blocks match {

      case Some(b) => ! page.article.blocks.get.body.exists((block: BodyBlock) => {

        val hasUnsupportedElements: Boolean = block.elements.flatMap {
          case b: TextBlockElement => None
          case b: ImageBlockElement => None
          case b => Some(b)
        }.nonEmpty

        hasUnsupportedElements

      })

      case None => true

    }

  }

  private def isAdFree(page: PageWithStoryPackage): Boolean = {
    page.metadata.sensitive
  }

  def getRenderTierFor(page: PageWithStoryPackage): RenderType = {

    val canRemotelyRender = isSupportedType(page) &&
      hasBlocks(page) &&
      hasOnlySupportedElements(page) &&
      isDiscussionDisabled(page) &&
      isAdFree(page)

    if(canRemotelyRender){
      RemoteRender
    } else {
      LocalRender
    }

  }

}
