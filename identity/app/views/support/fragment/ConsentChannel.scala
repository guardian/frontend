package views.support.fragment

import com.gu.identity.model.User
import play.api.data.Field

object ConsentChannel {
  sealed abstract class ConsentChannelBehaviour(val id: String)
  case object TextConsentChannel extends ConsentChannelBehaviour("sms")
  case object PhoneOptOutConsentChannel extends ConsentChannelBehaviour("phone_optout")
  case object PostOptOutConsentChannel extends ConsentChannelBehaviour("post_optout")
  case object MarketResearchConsentChannel extends ConsentChannelBehaviour("market_research_optout")
  case object ProfilingConsentChannel extends ConsentChannelBehaviour("profiling_optout")

  private val channelsIds = List(
    TextConsentChannel.id,
    PhoneOptOutConsentChannel.id,
    PostOptOutConsentChannel.id,
    MarketResearchConsentChannel.id,
    ProfilingConsentChannel.id,
  )

  def channelsProvidedBy(user: User): List[ConsentChannelBehaviour] = {
    val telephoneDefined = user.privateFields.telephoneNumber.isDefined
    val postcodeDefined = user.privateFields.postcode.isDefined

    val channels = List(
      (TextConsentChannel -> telephoneDefined),
      (PhoneOptOutConsentChannel -> telephoneDefined),
      (PostOptOutConsentChannel -> postcodeDefined),
    )

    channels.filter(_._2).map(_._1)
  }

  /** Field is a channel and user has provided details for this channel */
  def isUsersChannel(consentField: Field, user: User): Boolean = {
    consentField("id").value.exists { id =>
      channelsIds.contains(id) && channelsProvidedBy(user).exists(_.id == id)
    }
  }

  def isSmsChannel(consentField: Field, user: User): Boolean =
    consentField("id").value.exists(_ == TextConsentChannel.id)

  def isOptOutChannel(consentField: Field, user: User): Boolean =
    consentField("id").value match {
      case Some(PhoneOptOutConsentChannel.id) | Some(PostOptOutConsentChannel.id) => true
      case _                                                                      => false
    }

  def isMarketResearch(consentField: Field, user: User): Boolean =
    consentField("id").value.exists(_ == MarketResearchConsentChannel.id)

  def isProfilingChannel(consentField: Field, user: User): Boolean =
    consentField("id").value.exists(_ == ProfilingConsentChannel.id)

  def isChannel(consentField: Field): Boolean = {
    consentField("id").value.exists { id => channelsIds.contains(id) }
  }

}
