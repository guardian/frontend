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
      "allowThirdPartyProfiling" -> optional(boolean),
      "consents" -> list(
        mapping(
          "actor" -> text,
          "id" -> text,
          "version" -> number,
          "consented" -> boolean,
          "timestamp" -> jodaDate(dateTimeFormatISO8601),
          "privacyPolicyVersion" -> number,
        )(Consent.apply)(Consent.unapply), // NOTE: Consent here is DO from identity-model
      ),
    )(PrivacyFormData.apply)(PrivacyFormData.unapply)

  protected def toUserFormData(userDO: User): PrivacyFormData =
    PrivacyFormData(userDO)

  protected lazy val idapiErrorContextToFormFieldKeyMap = Map(
    "statusFields.allowThirdPartyProfiling" -> "allowThirdPartyProfiling",
  )
}

/**
  * Form specific DTO representing marketing consent subset of User model
  */
case class PrivacyFormData(allowThirdPartyProfiling: Option[Boolean], consents: List[Consent]) extends UserFormData {

  def toUserUpdateDTO(oldUserDO: User): UserUpdateDTO =
    UserUpdateDTO(
      statusFields = Some(
        oldUserDO.statusFields.copy(
          allowThirdPartyProfiling = Some(allowThirdPartyProfiling.getOrElse(false)),
        ),
      ),
      consents = Some(consents),
    )
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
      allowThirdPartyProfiling = userDO.statusFields.allowThirdPartyProfiling,
      consents = if (userDO.consents.isEmpty) defaultConsents else onlyValidConsents(userDO),
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
    def consentExistsInModel(consent: Consent): Boolean =
      Try(Consent.wording(consent.id, consent.version)).isSuccess

    val newUserConsents = Consent.addNewDefaults(userDO.consents)
    val (validConsents, invalidConsents) = newUserConsents.partition(consentExistsInModel)

    invalidConsents.foreach(consent =>
      logger.error(s"User ${userDO.id} has invalid consent! Remove consent from Mongo DB: $consent"),
    )

    validConsents
  }
}
