package services

object PressAndNotify {
  def apply(ids: Set[String]) = {
    ContentApiPush.notifyContentApi(ids)
    FaciaPress.press(PressCommand(
      ids,
      live = true,
      draft = true
    ))
  }
}
