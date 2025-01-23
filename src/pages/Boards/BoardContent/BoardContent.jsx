import Box from "@mui/material/Box";
import ListColumns from "./ListColumns/ListColumns";
import {
  DndContext,
  // PointerSensor,
  // MouseSensor,
  // TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  pointerWithin,
  closestCorners,
  getFirstCollision,
} from "@dnd-kit/core";

import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useEffect, useRef, useState } from "react";
import Column from "./ListColumns/Column/Column";
import Card from "./ListColumns/Column/ListCards/Card/Card";
import { cloneDeep, isEmpty } from "lodash";
import { generatePlaceholderCard } from "~/utils/formatter";
import { MouseSensor, TouchSensor } from "~/customLibraries/DndKitSensors";

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: "ACTIVE_DRAG_ITEM_TYPE_COLUMN",
  CARD: "ACTIVE_DRAG_ITEM_TYPE_CARD",
};

function BoardContent({
  board,
  moveColumns,
  moveCardInSameColumn,
  moveCardToDifferentColumn,
}) {
  // const pointerSensor = useSensor(PointerSensor, {
  //   activationConstraint: { distance: 10 },
  // });
  //Di chuot 10px moi kich hoat event
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 },
  });
  const toughSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 500 },
  });

  const sensors = useSensors(mouseSensor, toughSensor);

  const [orderedColumns, setOrderedColumns] = useState([]);

  const [activeDragItemId, setActiveDragItemId] = useState(null);
  const [activeDragItemType, setActiveDragItemType] = useState(null);
  const [activeDragItemData, setActiveDragItemData] = useState(null);
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] =
    useState(null);

  //Điểm va chạm cuối cùng
  const lastOverId = useRef(null);

  useEffect(() => {
    //? sorted at _id.jsx
    setOrderedColumns(board.columns);
  }, [board]);

  //Tìm column theo cardId
  const findColumnByCardId = (cardId) => {
    return orderedColumns.find((column) =>
      column.cards.map((card) => card._id)?.includes(cardId)
    );
  };

  // Cập nhật state khi di chuyển giữa các column
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData,
    triggerFrom
  ) => {
    setOrderedColumns((prevColumns) => {
      //Tìm vị trí (index) của overCard trong Column đích (activeCard được thả)
      const overCardIndex = overColumn?.cards?.findIndex(
        (card) => card._id === overCardId
      );

      let newCardIndex;
      const isBelowOverItem =
        active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height;
      const modifier = isBelowOverItem ? 1 : 0;
      newCardIndex =
        overCardIndex >= 0
          ? overCardIndex + modifier
          : overColumn?.cards?.length + 1;

      const nextColumns = cloneDeep(prevColumns);
      const nextActiveColumn = nextColumns.find(
        (column) => column._id === activeColumn._id
      );
      const nextOverColumn = nextColumns.find(
        (column) => column._id === overColumn._id
      );

      if (nextActiveColumn) {
        // Xoá card ở column cũ
        nextActiveColumn.cards = nextActiveColumn.cards.filter(
          (card) => card._id !== activeDraggingCardId
        );

        //Thêm Placeholder Card
        if (isEmpty(nextActiveColumn.cards)) {
          nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)];
        }

        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(
          (card) => card._id
        );
      }

      if (nextOverColumn) {
        //Kiểm tra xem card đang kéo có tồn tại ở overColumn chưa, nếu có thì xoá trước
        nextOverColumn.cards = nextOverColumn.cards.filter(
          (card) => card._id !== activeDraggingCardId
        );

        const rebuild_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id,
        };

        //Thêm card đang kéo vào overColumn theo vị trí index mới
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(
          newCardIndex,
          0,
          rebuild_activeDraggingCardData
        );

        //Xoá Placeholder Card nếu đang tồn tại
        nextOverColumn.cards = nextOverColumn.cards.filter(
          (card) => !card.FE_PlaceholderCard
        );

        //Cập nhật mảng cardOrderIds
        nextOverColumn.cardOderIds = nextOverColumn.cards.map(
          (card) => card._id
        );
      }

      if (triggerFrom === "handleDragEnd") {
        moveCardToDifferentColumn(
          activeDraggingCardId,
          oldColumnWhenDraggingCard._id,
          nextOverColumn._id,
          nextColumns
        );
      }
      return nextColumns;
    });
  };

  //Trigger khi bat dau keo phan tu
  const handleDragStart = (event) => {
    setActiveDragItemId(event?.active?.id);
    setActiveDragItemType(
      event?.active?.data?.current?.columnId
        ? ACTIVE_DRAG_ITEM_TYPE.CARD
        : ACTIVE_DRAG_ITEM_TYPE.COLUMN
    );
    setActiveDragItemData(event?.active?.data?.current);

    //Nếu kéo card thì mới thực hiện hàh động set OldColumn
    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id));
    }
  };

  const handleDragOver = (event) => {
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return;

    const { active, over } = event;

    //Nếu không tồn tại active hoặc over (khi kéo ra ngoài) thì return => tránh lỗi
    if (!active || !over) return;

    const {
      id: activeDraggingCardId,
      data: { current: activeDraggingCardData },
    } = active;
    //overCard là card đang tương tác trên hoặc dưới so với card được kéo
    const { id: overCardId } = over;

    //Tìm 2 columns theo cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId);
    const overColumn = findColumnByCardId(overCardId);

    if (!activeColumn || !overColumn) return;

    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData,
        "handleDragOver"
      );
    }
  };

  //Trigger khi keets thuc hanh dong keo tha phan tu
  const handleDragEnd = (event) => {
    const { active, over } = event;
    //Neu khong ton tai over thi return => tranh loi
    if (!active || !over) return;

    if (activeDragItemType == ACTIVE_DRAG_ITEM_TYPE.CARD) {
      const {
        id: activeDraggingCardId,
        data: { current: activeDraggingCardData },
      } = active;
      //overCard là card đang tương tác trên hoặc dưới so với card được kéo
      const { id: overCardId } = over;

      //Tìm 2 columns theo cardId
      const activeColumn = findColumnByCardId(activeDraggingCardId);
      const overColumn = findColumnByCardId(overCardId);

      if (!activeColumn || !overColumn) return;

      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        //Kéo thả card giữa 2 column
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData,
          "handleDragEnd"
        );
      } else {
        //Kéo thả card trong 1 column
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(
          (c) => c._id === activeDragItemId
        ); //Lay vi tri cu (từ OldColumnWhenDraggingCard)
        const newCardIndex = overColumn?.cards?.findIndex(
          (c) => c._id === overCardId
        ); //Lay vi tri moi (từ over)

        const dndOrderedCards = arrayMove(
          oldColumnWhenDraggingCard?.cards,
          oldCardIndex,
          newCardIndex
        );

        const dndOrderCardIds = dndOrderedCards.map((card) => card._id);

        setOrderedColumns((prevColumns) => {
          const nextColumns = cloneDeep(prevColumns);

          //Tìm tới column đang thả
          const targetColumn = nextColumns.find(
            (column) => column._id === overColumn._id
          );

          //Cập nhật 2 giá trị mới là Card và CardIds trong targetColumn
          targetColumn.cards = dndOrderedCards;
          targetColumn.cardOrderIds = dndOrderCardIds;

          return nextColumns;
        });

        //Call API
        moveCardInSameColumn(
          dndOrderedCards,
          dndOrderCardIds,
          oldColumnWhenDraggingCard._id
        );
      }
    }

    //Xử lí kéo thả Column trong 1 BoardContent
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      if (active.id !== over.id) {
        const oldColumnIndex = orderedColumns.findIndex(
          (c) => c._id === active.id
        ); //Lay vi tri cu
        const newColumnIndex = orderedColumns.findIndex(
          (c) => c._id === over.id
        ); //Lay vi tri moi

        const dndOrderedColumn = arrayMove(
          orderedColumns,
          oldColumnIndex,
          newColumnIndex
        );
        // const dndOrderedColumnIds = dndOrderedColumn.map((c) => c._id);
        // console.log(
        //   "🚀 ~ handleDragEnd ~ dndOrderedColumnIds:",
        //   dndOrderedColumnIds
        // );
        setOrderedColumns(dndOrderedColumn);

        moveColumns(dndOrderedColumn);
      }

      setActiveDragItemData(null);
      setActiveDragItemId(null);
      setActiveDragItemType(null);
      setOldColumnWhenDraggingCard(null);
    }
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  };

  const collisionDetectionStrategy = useCallback(
    (args) => {
      //Kéo column thì dùng thuật toán ClosestCenter
      if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
        return closestCorners({ ...args });
      }

      const pointerIntersections = pointerWithin(args);

      if (!pointerIntersections?.length) return;

      // const intersections =
      //   pointerIntersections.length > 0
      //     ? pointerIntersections
      //     : rectIntersection(args);

      let overId = getFirstCollision(pointerIntersections, "id");

      if (overId) {
        const checkColumn = orderedColumns.find(
          (column) => column._id === overId
        );
        if (checkColumn) {
          overId = closestCorners({
            ...args,
            droppableContainers: args.droppableContainers.filter(
              (container) => {
                return (
                  container.id !== overId &&
                  checkColumn?.cardOrderIds?.includes(container.id)
                );
              }
            ),
          })[0]?.id;
        }

        lastOverId.current = overId;
        return [{ id: overId }];
      }

      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeDragItemType, orderedColumns]
  );

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      // collisionDetection={closestCorners}

      //Custom thuật toán va chạm
      collisionDetection={collisionDetectionStrategy}
      sensors={sensors}
    >
      <Box
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "#34495e" : "#1976d2",
          width: "100%",
          height: (theme) => theme.trello.boardContentHeight,
          p: "10px 0",
        }}
      >
        <ListColumns
          columns={orderedColumns}
          // createNewCard={createNewCard}
          // deleteColumnDetails={deleteColumnDetails}
        />
        <DragOverlay dropAnimation={dropAnimation}>
          {!activeDragItemType && null}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && (
            <Column column={activeDragItemData} />
          )}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD && (
            <Card card={activeDragItemData} />
          )}
        </DragOverlay>
      </Box>
    </DndContext>
  );
}

export default BoardContent;
