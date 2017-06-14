package services

import java.io.Reader
import javax.script._
import jdk.nashorn.api.scripting.JSObject
import scala.util.Try

class JavascriptEngine() {
  import JavascriptEngine._

  private lazy val bindings = shared.createBindings()

  def put(name: String, value: Object): Try[AnyRef] = Try(bindings.put(name, value))

  def eval(script: String): Try[JSObject] = Try(shared.eval(script, bindings).asInstanceOf[JSObject])
  def eval(reader: Reader): Try[JSObject] = Try(shared.eval(reader, bindings).asInstanceOf[JSObject])

  def call[A](functionName: String, args: JSObject*)(script: JSObject): Try[A] = Try(script.call(functionName, args:_*).asInstanceOf[A])
}

object JavascriptEngine {
  private val shared: ScriptEngine = new ScriptEngineManager(null).getEngineByName("nashorn")
}
