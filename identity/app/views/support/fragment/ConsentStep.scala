package views.support.fragment

import play.twirl.api.Html


object ConsentStep {

  sealed trait ConsentStepHelpTextTrait

  case class ConsentStepHelpLegalText(text: String) extends ConsentStepHelpTextTrait

  case class ConsentStepHelpText(text: String) extends ConsentStepHelpTextTrait


  case class ConsentStep(
    name: String,
    title: String,
    help: List[ConsentStepHelpTextTrait] = Nil,
    content: Html = Html(""),
    show: Boolean = true
  )

}
