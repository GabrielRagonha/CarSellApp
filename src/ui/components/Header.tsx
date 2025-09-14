import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";

const Header: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Box display="flex" alignItems="center">
          <DirectionsCarIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            CarSellApp
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
