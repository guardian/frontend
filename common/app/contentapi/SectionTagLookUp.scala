package contentapi

import common.Maps.RichMap
import conf.Switches
import Function.const

object SectionTagLookUp {
  private val ExceptionsMap = Map(
    "uk-news" -> "uk/uk"
  )

  private val ExceptionsReverseMap = ExceptionsMap.reverseMap

  private def useExceptions[A] =
    const[Boolean, A](Switches.HardcodedSectionTagLookUp.isSwitchedOn) _

  def tagId(sectionId: String) = {
    ExceptionsMap.get(sectionId).filter(useExceptions).getOrElse(s"$sectionId/$sectionId")
  }

  def sectionId(tagId: String) = ExceptionsReverseMap.get(tagId).filter(useExceptions) orElse (tagId.split('/').toList match {
    case a :: b :: Nil if a == b => Some(a)
    case _ => None
  })
}
