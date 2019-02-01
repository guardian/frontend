package views.support

import conf.Configuration
import play.twirl.api.Html


object DropdownMenus {

  case class DropdownMenuItem (
    href: Option[String]  = None,
    linkName: Option[String]  = None,
    label: String,
    classList: List[String] = List(),
    parentClassList: List[String] = List(),
    icon: Option[String] = None,
    divider: Boolean = false,
  )

  val accountDropdownMenu: List[DropdownMenuItem] = List(
    DropdownMenuItem(
      linkName = Some("comment activity"),
      label = "Comments & replies",
      classList = List("js-add-comment-activity-link"),
      parentClassList = List("u-h","js-show-comment-activity")
    ),
    DropdownMenuItem(
      href = Some(s"${Configuration.id.url}/public/edit"),
      linkName = Some("edit profile"),
      label = "Public profile",
    ),
    DropdownMenuItem(
      href = Some(s"${Configuration.id.url}/account/edit"),
      linkName = Some("account details"),
      label = "Account details",
    ),
    DropdownMenuItem(
      href = Some(s"${Configuration.id.url}/email-prefs"),
      linkName = Some("email prefs"),
      label = "Emails & marketing"
    ),
    DropdownMenuItem(
      href = Some(s"${Configuration.id.mmaUrl}/membership"),
      linkName = Some("membership"),
      label = "Membership",
      divider = true,
    ),
    DropdownMenuItem(
      href = Some(s"${Configuration.id.mmaUrl}/contributions"),
      linkName = Some("contributions"),
      label = "Contributions",
    ),
    DropdownMenuItem(
      href = Some(s"${Configuration.id.mmaUrl}/subscriptions"),
      linkName = Some("subscriptions"),
      label = "Subscriptions",
    ),
    DropdownMenuItem(
      href = Some(s"${Configuration.id.url}/signout"),
      linkName = Some("sign out"),
      label = "Sign out",
      icon = Some(
        "log-off"
      ),
      divider = true,
    )
  )

}
