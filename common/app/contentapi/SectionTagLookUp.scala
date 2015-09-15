package contentapi

import common.Maps.RichMap
import conf.switches.Switches
import Function.const

object SectionTagLookUp {
  private val ExceptionsMap = Map(
    "uk-news" -> "uk/uk"
  )

  private val ExceptionsReverseMap = ExceptionsMap.reverseMap

  def tagId(sectionId: String) = {
    ExceptionsMap.getOrElse(sectionId, s"$sectionId/$sectionId")
  }

  def sectionId(tagId: String) = ExceptionsReverseMap.get(tagId) orElse (tagId.split('/').toList match {
    case a :: b :: Nil if a == b => Some(a)
    case _ => None
  })
}
