package services

object IdGeneration {
  def nextId = java.util.UUID.randomUUID().toString
}
