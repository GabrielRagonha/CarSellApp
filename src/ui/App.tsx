import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import ContractGenerator from "./components/ContractGenerator";
import Header from "./components/Header";
import { Container, Box } from "@mui/material";

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
    mode: "light",
  },
});

const App: React.FC = () => {
  const [templates, setTemplates] = useState<string[]>([]);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const availableTemplates = await window.electron.getTemplates();
        setTemplates(availableTemplates);
      } catch (error: any) {
        console.error("Falha ao carregar modelos:", error);
      }
    };

    loadTemplates();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Header />
        <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
          <ContractGenerator templates={templates} />
        </Container>
        <Box
          component="footer"
          sx={{ py: 3, bgcolor: "background.paper", textAlign: "center" }}
        >
          © {new Date().getFullYear()} CarSellApp - Todos direitos reservados
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
