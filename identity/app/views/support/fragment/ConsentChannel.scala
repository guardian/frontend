package views.support.fragment

import play.twirl.api.Html
import views.support.fragment.Switch.ConsentSwitch
import com.gu.identity.model.User

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

  def communicationChannelsForUser(user: User): List[ConsentChannelBehaviour] = {
    val telephoneDefined = user.privateFields.telephoneNumber.isDefined
    val postcodeDefined = user.privateFields.postcode.isDefined

    val channels = List(
      (TextConsentChannel -> telephoneDefined),
      (PhoneConsentChannel -> telephoneDefined),
      (PostConsentChannel -> postcodeDefined)
    )

    channels.filter(_._2).map(_._1)
  }

}

