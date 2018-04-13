package form

import com.gu.identity.model.Consent._
import com.gu.identity.model.{Consent, StatusFields, User}
import idapiclient.UserUpdateDTO
import play.api.data.Forms._
import play.api.data.JodaForms.jodaDate
import play.api.data.Mapping
import play.api.i18n.MessagesProvider
import utils.SafeLogging
import scala.util.Try

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

  protected lazy val idapiErrorContextToFormFieldKeyMap = Map(
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

    UserUpdateDTO(
      statusFields = Some(StatusFields(
        receive3rdPartyMarketing = newReceive3rdPartyMarketing,
        receiveGnmMarketing = newReceiveGnmMarketing,
        allowThirdPartyProfiling = newAllowThirdPartyProfiling
      )),
      consents = Some(consents))
  }
}

object PrivacyFormData extends SafeLogging {
  /**
    * Converts User DO from IDAPI to form processing DTO PrivacyFromData
    *
    * @param userDO Identity User domain model from IDAPI defiend in identity-model library
    * @return form processing DTO PrivacyFromData
    */
  def apply(userDO: User): PrivacyFormData = {
    PrivacyFormData(
      receiveGnmMarketing = userDO.statusFields.receiveGnmMarketing,
      receive3rdPartyMarketing = userDO.statusFields.receive3rdPartyMarketing,
      allowThirdPartyProfiling = userDO.statusFields.allowThirdPartyProfiling,
      consents = if (userDO.consents.isEmpty) defaultConsents else onlyValidConsents(userDO)
    )
  }

  /**
    * FIXME: Once GDPR goes live, clean Mongo DB of old consents, and remove this method.
    *
    * Filter out any invalid consents that are still lingering in Mongo DB.
    *
    * For example, if consent id is renamed, then some users might still have the old consent.
    *
    * @param userDO Identity User domain model from IDAPI defiend that might contain some old invalid consents
    * @return list of valid consents
    */
  private def onlyValidConsents(userDO: User): List[Consent] = {
    def consentExistsInModel(consent:Consent): Boolean =
      Try(Consent.wording(consent.id, consent.version)).isSuccess

    val (validConsents, invalidConsents) = userDO.consents.partition(consentExistsInModel)

    invalidConsents.foreach(consent =>
      logger.error(s"User ${userDO.id} has invalid consent! Remove consent from Mongo DB: $consent"))

    validConsents
  }
}
