package services

object R2PagePressNotifier {

  def enqueue(path: String) = R2PressNotification.sendWithoutSubject(path)

}
