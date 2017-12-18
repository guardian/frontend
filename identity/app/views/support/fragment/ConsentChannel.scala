package views.support.fragment

// Helper for consentJourney.scala.html

object ConsentChannel {
    sealed trait ConsentChannelBehaviour
    case object TextConsentChannel extends ConsentChannelBehaviour
    case object PhoneConsentChannel extends ConsentChannelBehaviour
    case object PostConsentChannel extends ConsentChannelBehaviour

    def checkboxName(behaviour: ConsentChannelBehaviour): String = {
        behaviour match {
            case TextConsentChannel => "Text"
            case PhoneConsentChannel => "Phone"
            case PostConsentChannel => "Post"
        }
    }

}

