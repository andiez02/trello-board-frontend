import { Box, CircularProgress, Typography } from "@mui/material";
import React from "react";

function PageLoadingSpinner({ caption }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        width: "100%",
        height: "100vh",
      }}
    >
      <CircularProgress />
      <Typography>{caption}</Typography>
    </Box>
  );
}

export default PageLoadingSpinner;
