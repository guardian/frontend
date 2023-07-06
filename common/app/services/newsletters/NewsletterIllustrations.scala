package services.newsletters

object newsletterIllustrations {

  def get(identityName: String):Option[String] = {

    if (identityName == "afternoon-update") {
      return Option.apply(
        "https://i.guim.co.uk/img/media/50b02d4e4a32def95d8d26cc852549e6bd83f037/0_0_1850_1111/500.jpg?width=250&quality=45&s=6325bb62e51f4af4d43e8bafb28b3e6d",
      )
    }
    if (identityName == "first-dog") {
      return Option.apply(
        "https://i.guim.co.uk/img/media/c58a6d24a640b81ab989f1902ae46bbb1f445291/0_0_1637_982/500.jpg?width=250&quality=45&s=93fd2aeeb3c31c89ad9302afb7fba5af",
      )
    }

    Option.empty[String]
  }
}
