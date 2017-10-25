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
      "consents" -> list(
        mapping(
          "actor" -> text,
          "consentIdentifier" -> text,
          "consentIdentifierVersion" -> number,
          "hasConsented" -> boolean,
          "timestamp" -> jodaDate(dateTimeFormatISO8601),
          "privacyPolicy" -> number
        )(Consent.apply)(Consent.unapply)
      )
    )(PrivacyFormData.apply)(PrivacyFormData.unapply)

  protected def toUserFormData(userFromApi: User): PrivacyFormData =
    PrivacyFormData(userFromApi)

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
    consents: List[Consent]) extends UserFormData{

  def toUserUpdate(oldUserFromApi: User): UserUpdateDTO =
    UserUpdateDTO(consents = Some(consents))
}

object PrivacyFormData {
  /**
    * Converts User DO from IDAPI to form processing DTO PrivacyFromData
    *
    * @param userFromApi Identity User domain model from IDAPI defiend in identity-model library
    * @return form processing DTO PrivacyFromData
    */
  def apply(userFromApi: User): PrivacyFormData =
    PrivacyFormData(
      consents = if (userFromApi.consents.isEmpty) defaultConsents else userFromApi.consents)

  private val defaultConsents =
    List(
      Consent("user", "firstParty", false),
      Consent("user", "thirdParty", false),
      Consent("user", "thirdPartyProfiling", false))
}
