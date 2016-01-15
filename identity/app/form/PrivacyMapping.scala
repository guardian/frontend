package form

import com.gu.identity.model.User
import idapiclient.UserUpdate
import play.api.data.Forms._
import play.api.i18n.Messages.Implicits._
import play.api.Play.current

object PrivacyMapping extends UserFormMapping[PrivacyFormData] {
  override val messagesApi = applicationMessagesApi

  protected lazy val formMapping = mapping(
    "receiveGnmMarketing" -> boolean,
    "receive3rdPartyMarketing" -> boolean
  )(PrivacyFormData.apply)(PrivacyFormData.unapply)

  protected def fromUser(user: User) = PrivacyFormData(user)

  protected lazy val contextMap =  Map(
    "statusFields.receiveGnmMarketing" -> "receiveGnmMarketing",
    "statusFields.receive3rdPartyMarketing" -> "receive3rdPartyMarketing"
  )
}

trait PrivacyMapping {
  val privacyMapping = PrivacyMapping
}

case class PrivacyFormData(
                            receiveGnmMarketing: Boolean,
                            receive3rdPartyMarketing: Boolean
                            ) extends UserFormData{

  def toUserUpdate(currentUser: User): UserUpdate = {
    val statusFields = currentUser.statusFields
    UserUpdate(
      statusFields = Some(statusFields.copy(
        receive3rdPartyMarketing = Some(receive3rdPartyMarketing),
        receiveGnmMarketing = Some(receiveGnmMarketing)
      ))
    )
  }

}

object PrivacyFormData {
  def apply(user: User): PrivacyFormData = PrivacyFormData(
    receiveGnmMarketing = user.statusFields.receiveGnmMarketing.getOrElse(false),
    receive3rdPartyMarketing = user.statusFields.receive3rdPartyMarketing.getOrElse(false)
  )
}
