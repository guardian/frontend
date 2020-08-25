package views.support.fragment

// Helper for fragments.form.switch.scala.html

object Switch {
  sealed trait SwitchBehaviour
  case object AdvertSwitch extends SwitchBehaviour // Ad prefereces
  case object ConsentSwitch extends SwitchBehaviour // Marketing consent like supporter, jobs, etc.
  case object NewsletterSwitch extends SwitchBehaviour // Newsletter consent like Guardian Today, etc.

  def switchJsBehaviour(behaviour: SwitchBehaviour): String = {
    behaviour match {
      case ConsentSwitch    => "js-manage-account__consentCheckbox"
      case NewsletterSwitch => "js-manage-account__newsletterCheckbox"
      case _                => ""
    }
  }

  def switchBehaviour(behaviour: SwitchBehaviour): String = {
    behaviour match {
      case ConsentSwitch    => "consent"
      case NewsletterSwitch => "newsletter"
      case _                => ""
    }
  }

}
