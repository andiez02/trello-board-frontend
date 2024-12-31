import GroupIcon from "@mui/icons-material/Group";
import CommentIcon from "@mui/icons-material/Comment";
import AttachmentIcon from "@mui/icons-material/Attachment";
import {
  Button,
  Card as MuiCard,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";

const Card = ({ temporaryHideMedia }) => {
  if (temporaryHideMedia) {
    return (
      <MuiCard
        sx={{
          cursor: "pointer",
          boxShadow: "0 1px 1px rgba(0, 0, 0, 0.2)",
          overflow: "unset",
        }}
      >
        <CardContent sx={{ p: 1.5, "&:last-child": { p: 1.5 } }}>
          <Typography>Card 01</Typography>
        </CardContent>
      </MuiCard>
    );
  }
  return (
    <div>
      <MuiCard
        sx={{
          cursor: "pointer",
          boxShadow: "0 1px 1px rgba(0, 0, 0, 0.2)",
          overflow: "unset",
        }}
      >
        <CardMedia
          sx={{ height: 140 }}
          image="https://i.pinimg.com/736x/43/3c/79/433c79427f98546fe23f36fbb25f3f3d.jpg"
          title="green iguana"
        />
        <CardContent sx={{ p: 1.5, "&:last-child": { p: 1.5 } }}>
          <Typography>Andiez Trello Board</Typography>
        </CardContent>
        <CardActions
          sx={{
            p: "0 4px 8px 4px",
          }}
        >
          <Button size="small" startIcon={<GroupIcon />}>
            20
          </Button>
          <Button size="small" startIcon={<CommentIcon />}>
            15
          </Button>
          <Button size="small" startIcon={<AttachmentIcon />}>
            10
          </Button>
        </CardActions>
      </MuiCard>
    </div>
  );
};

export default Card;
