package form

import com.gu.identity.model.{Consent, User}
import idapiclient.UserUpdateDTO
import play.api.data.Forms._
import play.api.data.JodaForms.jodaDate
import play.api.data.Mapping
import play.api.i18n.MessagesProvider

class PrivacyMapping extends UserFormMapping[PrivacyFormData] {

  private val dateTimeFormatISO8601: String = "yyyy-MM-dd'T'HH:mm:ssZZ"

  protected def formMapping(implicit messagesProvider: MessagesProvider): Mapping[PrivacyFormData] =
    mapping(
      "receiveGnmMarketing" -> boolean,     // TODO: statusFields to be removed once GDPR V2 is in PROD
      "receive3rdPartyMarketing" -> boolean,
      "allowThirdPartyProfiling" -> boolean,
      "consents" -> list(
        mapping(
          "actor" -> text,
          "consentIdentifier" -> text,
          "consentIdentifierVersion" -> number,
          "hasConsented" -> boolean,
          "timestamp" -> jodaDate(dateTimeFormatISO8601),
          "privacyPolicy" -> number
        )(Consent.apply)(Consent.unapply) // NOTE: Consent here is DO from identity-model
      )
    )(PrivacyFormData.apply)(PrivacyFormData.unapply)

  protected def toUserFormData(userDO: User): PrivacyFormData =
    PrivacyFormData(userDO)

  protected lazy val idapiErrorContextToFormFieldKeyMap =  Map(
    "statusFields.receiveGnmMarketing" -> "receiveGnmMarketing",
    "statusFields.receive3rdPartyMarketing" -> "receive3rdPartyMarketing",
    "statusFields.allowThirdPartyProfiling" -> "allowThirdPartyProfiling"
  )
}

/**
  * Form specific DTO representing marketing consent subset of User model
  */
case class PrivacyFormData(
    receiveGnmMarketing: Boolean,
    receive3rdPartyMarketing: Boolean,
    allowThirdPartyProfiling: Boolean,
    consents: List[Consent]) extends UserFormData{

  def toUserUpdateDTO(oldUserDO: User): UserUpdateDTO =
    UserUpdateDTO(
      statusFields = Some(oldUserDO.statusFields.copy(
      receive3rdPartyMarketing = Some(receive3rdPartyMarketing),
      receiveGnmMarketing = Some(receiveGnmMarketing),
      allowThirdPartyProfiling = Some(allowThirdPartyProfiling)
      )),
      consents = Some(consents))
}

object PrivacyFormData {
  /**
    * Converts User DO from IDAPI to form processing DTO PrivacyFromData
    *
    * @param userDO Identity User domain model from IDAPI defiend in identity-model library
    * @return form processing DTO PrivacyFromData
    */
  def apply(userDO: User): PrivacyFormData =
    PrivacyFormData(
      receiveGnmMarketing = userDO.statusFields.receiveGnmMarketing.getOrElse(false),
      receive3rdPartyMarketing = userDO.statusFields.receive3rdPartyMarketing.getOrElse(false),
      allowThirdPartyProfiling = userDO.statusFields.allowThirdPartyProfiling.getOrElse(true),
      consents = if (userDO.consents.isEmpty) defaultConsents else userDO.consents)

  private val defaultConsents =
    List(
      Consent("user", "firstParty", false),
      Consent("user", "thirdParty", false),
      Consent("user", "thirdPartyProfiling", false))
}
