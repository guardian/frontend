package controllers.editprofile

import com.gu.identity.model.User
import form._
import model.IdentityPage
import play.api.data.Form
import play.api.i18n.MessagesProvider

/**
  * Holds all Edit Profile forms and designates which one is user currently viewing
  *
  * @param accountForm  /account/edit
  * @param privacyForm  /privacy/edit
  * @param activePage   which page is user currently viewing and hence which form
  */
case class ProfileForms(
    accountForm: Form[AccountFormData],
    privacyForm: Form[PrivacyFormData],
    activePage: IdentityPage,
)

object ProfileForms {

  /**
    * Constructs ProfileForms instance by filling all the Edit Profile forms (Public, Account, Privacy)
    * with the corresponding DTO that will be constructed out of the provided User DO
    *
    * @param userDO User domain object from IDAPI used to create per-form specialised DTO fillers
    * @param activePage Which page is user currently viewing
    * @param profileFormsMapping Case class with mappings for all the forms
    * @return instance of ProfileForms having all the forms bound to their respective specialised DTO
    */
  def apply(userDO: User, activePage: IdentityPage)(implicit
      profileFormsMapping: ProfileFormsMapping,
      messagesProvider: MessagesProvider,
  ): ProfileForms = {

    ProfileForms(
      accountForm = profileFormsMapping.accountDetailsMapping.fillForm(userDO),
      privacyForm = profileFormsMapping.privacyMapping.fillForm(userDO),
      activePage = activePage,
    )

  }

}
