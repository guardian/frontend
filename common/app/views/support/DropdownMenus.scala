package views.support

import conf.Configuration

object DropdownMenus {

  case class DropdownMenuItem(
      href: Option[String] = None,
      linkName: Option[String] = None,
      linkId: String, // used by Braze to target notifications
      label: String,
      classList: List[String] = List(),
      parentClassList: List[String] = List(),
      icon: Option[String] = None,
      divider: Boolean = false,
  )

  val accountDropdownMenu: List[DropdownMenuItem] = List(
    DropdownMenuItem(
      href = Some(Configuration.id.mmaUrl),
      linkName = Some("account overview"),
      label = "Account overview",
      linkId = "account_overview"
    ),
    DropdownMenuItem(
      href = Some(s"${Configuration.id.mmaUrl}/billing"),
      linkName = Some("billing"),
      label = "Billing",
      linkId = "billing"
    ),
    DropdownMenuItem(
      href = Some(s"${Configuration.id.mmaUrl}/public-settings"),
      linkName = Some("profile"),
      label = "Profile",
      linkId = "edit_profile"
    ),
    DropdownMenuItem(
      href = Some(s"${Configuration.id.mmaUrl}/email-prefs"),
      linkName = Some("email prefs"),
      label = "Emails & marketing",
      linkId = "email_prefs"
    ),
    DropdownMenuItem(
      href = Some(s"${Configuration.id.mmaUrl}/account-settings"),
      linkName = Some("settings"),
      label = "Settings",
      linkId = "settings"
    ),
    DropdownMenuItem(
      href = Some(s"${Configuration.id.mmaUrl}/help"),
      linkName = Some("help"),
      label = "Help",
      linkId = "help"
    ),
    DropdownMenuItem(
      linkName = Some("comment activity"),
      label = "Comments & replies",
      classList = List("js-add-comment-activity-link"),
      parentClassList = List("u-h", "js-show-comment-activity"),
      divider = true,
      linkId = "comment_activity"
    ),
    DropdownMenuItem(
      href = Some(s"${Configuration.id.url}/signout"),
      linkName = Some("sign out"),
      label = "Sign out",
      icon = Some("log-off"),
      divider = true,
      linkId = "sign_out"
    ),
  )

}
