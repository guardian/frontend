package services

object Press {
  def fromSetOfIds(ids: Set[String]) = {
    FaciaPress.press(PressCommand(
      ids,
      live = true,
      draft = true
    ))
  }
}
