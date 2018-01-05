package views.support.fragment

import com.gu.identity.model.User
import play.api.data.Field

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

  def isChannel(consentField: Field): Boolean = {
    consentField("id").value.exists {
      id => List("phone", "sms", "post").contains(id)
    }
  }

}

