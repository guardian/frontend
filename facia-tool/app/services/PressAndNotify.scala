package services

object PressAndNotify {
  def apply(ids: Set[String]) = {
    FaciaPress.press(PressCommand(
      ids,
      live = true,
      draft = true
    ))
  }
}
