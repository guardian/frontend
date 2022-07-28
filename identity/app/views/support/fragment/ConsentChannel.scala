package views.support.fragment

import com.gu.identity.model.{Consent, User}
import play.api.data.Field

object ConsentChannel {
  sealed abstract class ConsentChannelBehaviour(val id: String)
  // channels
  case object TextConsentChannel extends ConsentChannelBehaviour(Consent.CommunicationSms.id)
  case object PhoneOptOutConsentChannel extends ConsentChannelBehaviour(Consent.PhoneOptout.id)
  case object PostOptOutConsentChannel extends ConsentChannelBehaviour(Consent.PostOptout.id)
  case object MarketResearchConsentChannel extends ConsentChannelBehaviour(Consent.MarketResearchOptout.id)
  case object ProfilingConsentChannel extends ConsentChannelBehaviour(Consent.ProfilingOptout.id)
  case object PersonalisedAdvertisingConsentChannel extends ConsentChannelBehaviour(Consent.PersonalisedAdvertising.id)

  private val channelsIds = List(
    TextConsentChannel.id,
    PhoneOptOutConsentChannel.id,
    PostOptOutConsentChannel.id,
    MarketResearchConsentChannel.id,
    ProfilingConsentChannel.id,
    PersonalisedAdvertisingConsentChannel.id,
  )

  private val productIds = List(
    Consent.YourSubscriptionSupport.id,
    Consent.SimilarGuardianProducts.id,
    Consent.SupporterNewsletter.id,
    Consent.SubscriberPreview.id,
    Consent.DigitalSubscriberPreview.id,
    Consent.GuardianWeeklyNewsletter.id,
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

  def isProduct(consentField: Field): Boolean = {
    consentField("id").value.exists { id => productIds.contains(id) }
  }
}
