package views.support.fragment

import com.gu.identity.model.User
import play.api.data.Field

object ConsentChannel {
  sealed abstract class ConsentChannelBehaviour(val channelName: String)

  case object TextConsentChannel  extends ConsentChannelBehaviour("sms")
  case object PhoneConsentChannel extends ConsentChannelBehaviour("phone")
  case object PostConsentChannel  extends ConsentChannelBehaviour("post")

  def channelsProvidedBy(user: User): List[ConsentChannelBehaviour] = {
    val telephoneDefined = user.privateFields.telephoneNumber.isDefined
    val postcodeDefined = user.privateFields.postcode.isDefined

    val channels = List(
      (TextConsentChannel -> telephoneDefined),
      (PhoneConsentChannel -> telephoneDefined),
      (PostConsentChannel -> postcodeDefined)
    )

    channels.filter(_._2).map(_._1)
  }

  /** Field is a channel and user has provided details for this channel */
  def isUsersChannel(consentField: Field, user: User): Boolean = {
      consentField("id").value.exists { id =>
        List("phone", "sms", "post").contains(id) && channelsProvidedBy(user).exists(_.channelName == id)
      }
  }

  def isChannel(consentField: Field): Boolean = {
    consentField("id").value.exists { id =>
      List("phone", "sms", "post").contains(id)
    }
  }

}

