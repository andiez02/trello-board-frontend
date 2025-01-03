import Box from "@mui/material/Box";
import ListColumns from "./ListColumns/ListColumns";
import { mapOrder } from "~/utils/sort";
import {
  DndContext,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useState } from "react";

function BoardContent({ board }) {
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 10 },
  });
  //Di chuot 10px moi kich hoat event
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 },
  });
  const toughSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 500 },
  });

  const sensors = useSensors(mouseSensor, toughSensor);

  const [orderedColumn, setOrderedColumn] = useState([]);

  useEffect(() => {
    setOrderedColumn(mapOrder(board?.columns, board?.columnOrderIds, "_id"));
  }, [board]);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    //Neu khong ton tai over thi return => tranh loi
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = orderedColumn.findIndex((c) => c._id === active.id); //Lay vi tri cu
      const newIndex = orderedColumn.findIndex((c) => c._id === over.id); //Lay vi tri moi

      const dndOrderedColumn = arrayMove(orderedColumn, oldIndex, newIndex);
      // const dndOrderedColumnIds = dndOrderedColumn.map((c) => c._id);
      // console.log(
      //   "🚀 ~ handleDragEnd ~ dndOrderedColumnIds:",
      //   dndOrderedColumnIds
      // );

      setOrderedColumn(dndOrderedColumn);
    }
  };
  return (
    <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
      <Box
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "#34495e" : "#1976d2",
          width: "100%",
          height: (theme) => theme.trello.boardContentHeight,
          p: "10px 0",
        }}
      >
        <ListColumns columns={orderedColumn} />
      </Box>
    </DndContext>
  );
}

export default BoardContent;
