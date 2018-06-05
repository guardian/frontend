package views.support

import conf.Configuration


object DropdownMenus {

  case class DropdownMenuItem (
    href: Option[String]  = None,
    linkName: Option[String]  = None,
    label: String,
    classList: List[String] = List(),
    parentClassList: List[String] = List()
  )

  val accountDropdownMenu: List[DropdownMenuItem] = List(
    DropdownMenuItem(
      linkName = Some("comment activity"),
      label = "Comments & Replies",
      classList = List("js-add-comment-activity-link"),
      parentClassList = List("u-h","js-show-comment-activity")
    ),
    DropdownMenuItem(
      href =Some(s"${Configuration.id.url}/public/edit"),
      linkName = Some("edit profile"),
      label = "Public profile",
    ),
    DropdownMenuItem(
      href =Some(s"${Configuration.id.url}/account/edit"),
      linkName = Some("account details"),
      label = "Account details",
    ),
    DropdownMenuItem(
      href =Some(s"${Configuration.id.url}/digitalpack/edit"),
      linkName = Some("subscriptions"),
      label = "Digital Pack",
    ),
    DropdownMenuItem(
      href =Some(s"${Configuration.id.url}/email-prefs"),
      linkName = Some("email prefs"),
      label = "Emails & marketing"
    ),
    DropdownMenuItem(
      href =Some(s"${Configuration.id.url}/signout"),
      linkName = Some("sign out"),
      label = "Sign out"
    )
  )

}
