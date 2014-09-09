package object dfp {

  def isValidForNextGenPageSkin(adUnit: String): Boolean = adUnit.endsWith("/front") || adUnit.endsWith("/front/ng")

}
