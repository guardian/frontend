package form

import com.gu.identity.model.User
import idapiclient.UserUpdate
import play.api.data.Forms._
import play.api.i18n.MessagesApi

class PrivacyMapping(val messagesApi: MessagesApi) extends UserFormMapping[PrivacyFormData] {

  protected lazy val formMapping = mapping(
    "receiveGnmMarketing" -> boolean,
    "receive3rdPartyMarketing" -> boolean,
    "allowThirdPartyProfiling" -> boolean
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
                            allowThirdPartyProfiling: Boolean
                            ) extends UserFormData{

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
    allowThirdPartyProfiling = user.statusFields.allowThirdPartyProfiling.getOrElse(true)
  )
}
