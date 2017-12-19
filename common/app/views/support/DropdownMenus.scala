package views.support

import conf.Configuration


object DropdownMenus {

  case class DropdownMenuItem (
    href: Option[String]  = None,
    dataName: Option[String]  = None,
    label: String,
    classList: List[String] = List(),
    parentClassList: List[String] = List()
  )

  val accountDropdownMenu: List[DropdownMenuItem] = List(
    DropdownMenuItem(
      dataName = Some("nav2 : topbar : comment activity"),
      label = "Comment activity",
      classList = List("js-add-comment-activity-link"),
      parentClassList = List("u-h","js-show-comment-activity")
    ),
    DropdownMenuItem(
      href =Some(s"${Configuration.id.url}/public/edit"),
      dataName = Some("nav2 : topbar : edit profile"),
      label = "Edit profile",
    ),
    DropdownMenuItem(
      href =Some(s"${Configuration.id.url}/email-prefs"),
      dataName = Some("nav2 : topbar : edit profile"),
      label = "Email preferences"
    ),
    DropdownMenuItem(
      href =Some(s"${Configuration.id.url}/password/change"),
      dataName = Some("nav2 : topbar : change password"),
      label = "Change password"
    ),
    DropdownMenuItem(
      href =Some(s"${Configuration.id.url}/signout"),
      dataName = Some("nav2 : topbar : sign out"),
      label = "Sign out"
    )
  )

}
