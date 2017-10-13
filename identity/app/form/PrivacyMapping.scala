package form

import com.gu.identity.model.{Consent, User}
import idapiclient.UserUpdate
import play.api.data.Forms._
import play.api.data.JodaForms.jodaDate
import play.api.data.Mapping
import play.api.i18n.MessagesProvider

class PrivacyMapping extends UserFormMapping[PrivacyFormData] {

  val DateTimeFormat: String = "yyyy-MM-dd'T'HH:mm:ss.SSSZ"

  protected def formMapping(implicit messagesProvider: MessagesProvider): Mapping[PrivacyFormData] = mapping(
    "receiveGnmMarketing" -> boolean,
    "receive3rdPartyMarketing" -> boolean,
    "allowThirdPartyProfiling" -> boolean,
    "consents" -> seq(
      mapping(
        "actor" -> text,
        "consentIdentifier" -> text,
        "consentIdentifierVersion" -> number,
        "hasConsented" -> boolean,
        "timestamp" -> jodaDate(DateTimeFormat),
        "privacyPolicy" -> number
      )(Consent.apply)(Consent.unapply)
    )
  )(PrivacyFormData.apply)(PrivacyFormData.unapply)

  protected def fromUser(user: User) = PrivacyFormData(user)

  protected lazy val contextMap =  Map(
    "statusFields.receiveGnmMarketing" -> "receiveGnmMarketing",
    "statusFields.receive3rdPartyMarketing" -> "receive3rdPartyMarketing",
    "statusFields.allowThirdPartyProfiling" -> "allowThirdPartyProfiling"
  )
}

case class PrivacyFormData(
    receiveGnmMarketing: Boolean,
    receive3rdPartyMarketing: Boolean,
    allowThirdPartyProfiling: Boolean,
    consents: Seq[Consent]) extends UserFormData{

  def toUserUpdate(currentUser: User): UserUpdate = {
    val statusFields = currentUser.statusFields
    UserUpdate(
      statusFields = Some(statusFields.copy(
        receive3rdPartyMarketing = Some(receive3rdPartyMarketing),
        receiveGnmMarketing = Some(receiveGnmMarketing),
        allowThirdPartyProfiling = Some(allowThirdPartyProfiling)
      ))
    )
  }
}

object PrivacyFormData {
  def apply(user: User): PrivacyFormData = PrivacyFormData(
    receiveGnmMarketing = user.statusFields.receiveGnmMarketing.getOrElse(false),
    receive3rdPartyMarketing = user.statusFields.receive3rdPartyMarketing.getOrElse(false),
    allowThirdPartyProfiling = user.statusFields.allowThirdPartyProfiling.getOrElse(true),
    consents = user.consents.toList
  )
}
