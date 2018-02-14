package views.support.fragment

import play.twirl.api.Html

object ConsentBlock {

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


  def renderBlocks(steps:List[ConsentBlock]): List[Html] = {
    val displaySteps = steps.filter(_.show)
    displaySteps.zipWithIndex.map{ case (block, index) =>
      block match {
        case m: ConsentStep => views.html.consentJourneyFragments.step(m, index == 0, index == (displaySteps.size - 1))
        case m: ConsentBanner => Html(s"<p class='form__success'>${m.title}</p>")
      }
    }
  }

}
