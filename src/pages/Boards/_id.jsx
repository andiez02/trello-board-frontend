import Container from "@mui/material/Container";
import AppBar from "~/components/AppBar/AppBar";
import BoardBar from "./BoardBar/BoardBar";
import BoardContent from "./BoardContent/BoardContent";

// import { mockData } from "~/apis/mock-data";
import { useEffect } from "react";
import {
  updateBoardDetailAPI,
  updateColumnDetailAPI,
  moveCardToDifferentColumnAPI,
} from "~/apis";
import {
  fetchBoardDetailAPI,
  updateCurrentActiveBoard,
  selectCurrentActiveBoard,
} from "~/redux/activeBoard/activeBoardSlice";
import { useDispatch, useSelector } from "react-redux";
import { cloneDeep } from "lodash";
import { useParams } from "react-router-dom";
import PageLoadingSpinner from "~/components/Loading/PageLoadingSpinner";
import { Box } from "@mui/material";

function Board() {
  const dispatch = useDispatch();
  // const [board, setBoard] = useState(null);
  const board = useSelector(selectCurrentActiveBoard);

  const { boardId } = useParams();

  useEffect(() => {
    // const boardId = "67848999fd4e30cb0c0e5078";
    //Call API
    dispatch(fetchBoardDetailAPI(boardId));
  }, [dispatch, boardId]);

  //Call API tạo mới Card và làm lại dữ liệu State Board
  // const createNewCard = async (newCardData) => {};
  //* -> Move to Column

  const moveColumns = (dndOrderedColumns) => {
    const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id);

    const newBoard = { ...board };
    newBoard.columns = dndOrderedColumns;
    newBoard.columnOrderIds = dndOrderedColumnsIds;
    dispatch(updateCurrentActiveBoard(newBoard));

    //Call API
    updateBoardDetailAPI(newBoard._id, {
      columnOrderIds: dndOrderedColumnsIds,
    });
  };

  const moveCardInSameColumn = (dndOrderedCards, dndOrderCardIds, columnId) => {
    //Update state Board
    const newBoard = cloneDeep(board);
    const columnToUpdate = newBoard.columns.find(
      (column) => column._id === columnId
    );
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards;
      columnToUpdate.cardOrderIds = dndOrderCardIds;
      dispatch(updateCurrentActiveBoard(newBoard));
    }

    //Call API update Board
    updateColumnDetailAPI(columnId, { cardOrderIds: dndOrderCardIds });
  };

  const moveCardToDifferentColumn = (
    currentCardId,
    prevColumnId,
    nextColumnId,
    dndOrderedColumns
  ) => {
    const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id);
    const newBoard = { ...board };
    newBoard.columns = dndOrderedColumns;
    newBoard.columnOrderIds = dndOrderedColumnsIds;
    dispatch(updateCurrentActiveBoard(newBoard));

    //Call API
    let prevCardOrderIds = dndOrderedColumns.find(
      (c) => c._id === prevColumnId
    )?.cardOrderIds;

    let nextCardOrderIds = dndOrderedColumns.find(
      (c) => c._id === nextColumnId
    )?.cardOrderIds;

    if (prevCardOrderIds[0].includes("placeholder-card")) prevCardOrderIds = [];
    if (nextCardOrderIds[0].includes("placeholder-card")) nextCardOrderIds = [];

    moveCardToDifferentColumnAPI({
      currentCardId,
      prevColumnId,
      prevCardOrderIds,
      nextColumnId,
      nextCardOrderIds,
    });
  };

  return (
    <Container disableGutters maxWidth={false} sx={{ height: "100vh" }}>
      {board ? (
        <Box>
          <AppBar />
          <BoardBar board={board} />

          <BoardContent
            board={board}
            // createNewColumn={createNewColumn}
            // createNewCard={createNewCard}
            // deleteColumnDetails={deleteColumnDetails}
            moveColumns={moveColumns}
            moveCardInSameColumn={moveCardInSameColumn}
            moveCardToDifferentColumn={moveCardToDifferentColumn}
          />
        </Box>
      ) : (
        <PageLoadingSpinner caption="Loading Board..." />
      )}
    </Container>
  );
}

export default Board;
