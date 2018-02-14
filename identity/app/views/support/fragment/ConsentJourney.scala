package views.support.fragment

import play.twirl.api.Html

object ConsentJourney {

  sealed abstract class ConsentBlock(
    val show: Boolean
  ) {}

  sealed trait ConsentStepHelpTextTrait

  case class ConsentStepHelpLegalText(text: String) extends ConsentStepHelpTextTrait

  case class ConsentStepHelpText(text: String) extends ConsentStepHelpTextTrait


  case class ConsentBanner(
    title: String
  ) extends ConsentBlock(show=true)


  case class ConsentStep(
    name: String,
    title: String,
    help: List[ConsentStepHelpTextTrait] = Nil,
    content: Html = Html(""),
    override val show: Boolean = true
  ) extends ConsentBlock(show)

}
