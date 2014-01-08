package model.abtests

object AbTests {

  private val abTests = common.AkkaAgent[Map[String, Seq[String]]](Map.empty)
  
  def getTests(): Map[String, Seq[String]] = {
      abTests.get
  }

  def update(testVariants: Map[String, Seq[String]]){
      abTests.send(testVariants)
  }
} 
