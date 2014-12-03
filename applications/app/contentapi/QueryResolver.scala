package contentapi

import common.Edition
import conf.LiveContentApi

object QueryResolver {
  def sectionTagId(sectionId: String) = s"$sectionId/$sectionId"

  def queryById(id: String, edition: Edition) = {
    SectionsLookUp.get(id) match {
      case Some(section) =>
        LiveContentApi.item(sectionTagId(id), edition)

      case _ =>
        LiveContentApi.item(id, edition)
    }


  }
}
