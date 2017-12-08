package form

import com.gu.identity.model.{Consent,User,ConsentWording}
import com.gu.identity.model.Consent._
import idapiclient.UserUpdateDTO
import play.api.data.Forms._
import play.api.data.JodaForms.jodaDate
import play.api.data.Mapping
import play.api.i18n.MessagesProvider
import utils.SafeLogging
import scala.util.{Try, Success, Failure}

class PrivacyMapping extends UserFormMapping[PrivacyFormData] {

  private val dateTimeFormatISO8601: String = "yyyy-MM-dd'T'HH:mm:ssZZ"

  def formMapping(implicit messagesProvider: MessagesProvider): Mapping[PrivacyFormData] =
    mapping(
      "receiveGnmMarketing" -> optional(boolean),     // TODO: statusFields to be removed once GDPR V2 is in PROD
      "receive3rdPartyMarketing" -> optional(boolean),
      "allowThirdPartyProfiling" -> optional(boolean),
      "consents" -> list(
        mapping(
          "actor" -> text,
          "id" -> text,
          "version" -> number,
          "consented" -> boolean,
          "timestamp" -> jodaDate(dateTimeFormatISO8601),
          "privacyPolicyVersion" -> number
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
    receiveGnmMarketing: Option[Boolean],
    receive3rdPartyMarketing: Option[Boolean],
    allowThirdPartyProfiling: Option[Boolean],
    consents: List[Consent]) extends UserFormData{

  /**
    * FIXME: Fix the semantic discrepancy between toUserUpdateDTO and toUserUpdateDTOAjax.
    * In the non-ajax case no value means set it to false while in the ajax case no value means use the old value.
    *
    * If a checkbox is unchecked then nothing is sent to dotocom identity frontend,
    * however IDAPI is expecting Some(false)
    *
    * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox:
    *
    * "Note: If a checkbox is unchecked when its form is submitted, there is no value submitted to
    * the server to represent its unchecked state (e.g. value=unchecked); the value is not submitted
    * to the server at all."
    */

  def toUserUpdateDTO(oldUserDO: User): UserUpdateDTO =
    UserUpdateDTO(
      statusFields = Some(oldUserDO.statusFields.copy(
        receive3rdPartyMarketing = Some(receive3rdPartyMarketing.getOrElse(false)),
        receiveGnmMarketing = Some(receiveGnmMarketing.getOrElse(false)),
        allowThirdPartyProfiling = Some(allowThirdPartyProfiling.getOrElse(false))
      )),
      consents = Some(consents))

  def toUserUpdateDTOAjax(oldUserDO: User): UserUpdateDTO = {

    val newReceiveGnmMarketing = receiveGnmMarketing match {
      case None => oldUserDO.statusFields.receiveGnmMarketing
      case Some(_) => receiveGnmMarketing
    }

    val newReceive3rdPartyMarketing = receive3rdPartyMarketing match {
      case None => oldUserDO.statusFields.receive3rdPartyMarketing
      case Some(_) => receive3rdPartyMarketing
    }

    val newAllowThirdPartyProfiling = allowThirdPartyProfiling match {
      case None => oldUserDO.statusFields.allowThirdPartyProfiling
      case Some(_) => allowThirdPartyProfiling
    }

    val newConsents = for {
      oldConsent <- oldUserDO.consents
      newConsent <- consents
    } yield {
      if (oldConsent.id == newConsent.id)
        newConsent
      else
        oldConsent
    }

    UserUpdateDTO(
      statusFields = Some(oldUserDO.statusFields.copy(
        receive3rdPartyMarketing = newReceive3rdPartyMarketing,
        receiveGnmMarketing = newReceiveGnmMarketing,
        allowThirdPartyProfiling = newAllowThirdPartyProfiling
      )),
      consents = Some(newConsents))
  }
}

object PrivacyFormData extends SafeLogging {

  /**
    * Checks if a consents is on the library and logs if not
    *
    * @param consent Consent object
    * @return true or false
    */
  def checkIfConsentExistsInModel(consent:Consent): Boolean = {
    Try(Consent.wording(consent.id, consent.version)) match {
      case Success(wording:ConsentWording) => true
      case Failure(f) => {
        LogMissingConsent(consent)
        false
      }
    }
  }

  /**
    * Logs a missing consent
    *
    * @param consent Consent object
    * @return true or false
    */
  def LogMissingConsent(consent:Consent): Unit = {
    logger.error(s"Failed to find consent in model: $consent.id")
  }

  /**
    * Converts User DO from IDAPI to form processing DTO PrivacyFromData
    *
    * @param userDO Identity User domain model from IDAPI defiend in identity-model library
    * @return form processing DTO PrivacyFromData
    */
  def apply(userDO: User): PrivacyFormData =
    PrivacyFormData(
      receiveGnmMarketing = userDO.statusFields.receiveGnmMarketing,
      receive3rdPartyMarketing = userDO.statusFields.receive3rdPartyMarketing,
      allowThirdPartyProfiling = userDO.statusFields.allowThirdPartyProfiling,
      consents = if (userDO.consents.isEmpty) defaultConsents else userDO.consents.filter(checkIfConsentExistsInModel)
    )
}
