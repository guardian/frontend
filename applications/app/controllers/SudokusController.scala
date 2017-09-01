package controllers

import common.ImplicitControllerExecutionContext
import conf.switches.Switches
import model.ApplicationContext
import play.api.mvc.{BaseController, ControllerComponents}
import sudoku.{SudokuApi, SudokuPage}
import views.html.sudoku

import scala.concurrent.Future

class SudokusController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
  extends BaseController with ImplicitControllerExecutionContext {
    def render(id: String) = Action.async { implicit request =>
    if (Switches.SudokuSwitch.isSwitchedOn) {
      SudokuApi.getData(id) map {
        case Some(sudokuData) =>
          Ok(sudoku(new SudokuPage(sudokuData)))

        case None => NotFound(s"No Sudoku with id $id")
      }
    } else {
      Future.successful(NotFound("Sudokus off"))
    }
  }
}
