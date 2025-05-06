import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Grid from "@mui/material/Grid";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Snackbar,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import {
  ContractFormInputs,
  ContractGeneratorProps,
} from "../../types/electron";

const steps = ["Selecione um modelo", "Preencha os dados", "Gerar o contrato"];

const ContractGenerator: React.FC<ContractGeneratorProps> = ({ templates }) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContractFormInputs>({
    defaultValues: {
      vehicleYear: new Date().getFullYear(),
      carPrice: 0,
      numberOfInstallments: 1,
      installmentValue: 0,
      contractDate: new Date().toISOString().split("T")[0],
    } as Partial<ContractFormInputs>,
  });

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleTemplateChange = (event: SelectChangeEvent<string>) => {
    setSelectedTemplate(event.target.value);
  };

  const closeAlert = () => setAlert((prev) => ({ ...prev, open: false }));

  const onSubmit: SubmitHandler<ContractFormInputs> = async (data) => {
    setLoading(true);
    try {
      const formattedPrice = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(data.carPrice);
      const formattedInstallment = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(data.installmentValue);

      const [year, month, day] = data.contractDate.split("-");
      const monthNames = [
        "janeiro",
        "fevereiro",
        "março",
        "abril",
        "maio",
        "junho",
        "julho",
        "agosto",
        "setembro",
        "outubro",
        "novembro",
        "dezembro",
      ];
      const formattedDateFull = `${parseInt(day, 10)} de ${
        monthNames[parseInt(month, 10) - 1]
      } de ${year}`;

      const formattedData: ContractFormInputs = {
        ...data,
        carPrice: formattedPrice as unknown as number,
        installmentValue: formattedInstallment as unknown as number,
        contractDate: formattedDateFull,
      };

      const savePath = await window.electron.showSaveDialog({
        defaultPath: `${data.buyerName}_${data.licensePlate}_Contrato.docx`,
      });
      if (!savePath) {
        setLoading(false);
        return;
      }

      const result = await window.electron.saveContract(
        selectedTemplate,
        formattedData,
        savePath
      );
      if (result.success) {
        setAlert({
          open: true,
          message: `Contrato salvo com sucesso em ${result.path}`,
          severity: "success",
        });
        setActiveStep(0);
      } else {
        throw new Error(result.error || "Falha ao gerar contrato");
      }
    } catch (error: any) {
      console.error(error);
      setAlert({
        open: true,
        message: `Erro: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth error={!selectedTemplate}>
              <InputLabel id="template-select-label">Modelos</InputLabel>
              <Select
                labelId="template-select-label"
                id="template-select"
                value={selectedTemplate}
                label="Modelos"
                onChange={handleTemplateChange}
              >
                {templates.length === 0 ? (
                  <MenuItem value="" disabled>
                    Nenhum modelo disponível
                  </MenuItem>
                ) : (
                  templates.map((template) => (
                    <MenuItem key={template} value={template}>
                      {template.replace(".docx", "")}
                    </MenuItem>
                  ))
                )}
              </Select>
              {!selectedTemplate && (
                <FormHelperText>
                  Selecione um modelo para prosseguir
                </FormHelperText>
              )}
            </FormControl>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Selecione o modelo apropriado para o seu contrato.
              </Typography>
            </Box>
          </Box>
        );
      case 1:
        return (
          <form id="contract-form">
            <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
              Informações do comprador
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...register("buyerName", { required: "Nome é obrigatório" })}
                  label="Nome completo"
                  fullWidth
                  error={!!errors.buyerName}
                  helperText={errors.buyerName?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...register("buyerRg", {
                    required: "RG é obrigatório",
                  })}
                  label="RG"
                  fullWidth
                  error={!!errors.buyerRg}
                  helperText={errors.buyerRg?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...register("buyerCpf", { required: "CPF é obrigatório" })}
                  label="CPF"
                  fullWidth
                  error={!!errors.buyerCpf}
                  helperText={errors.buyerCpf?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...register("buyerNationality", {
                    required: "Nacionalidade é obrigatória",
                  })}
                  label="Nacionalidade"
                  fullWidth
                  error={!!errors.buyerNationality}
                  helperText={errors.buyerNationality?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...register("buyerMaritalStatus", {
                    required: "Estado civil é obrigatório",
                  })}
                  label="Estado civil"
                  fullWidth
                  error={!!errors.buyerMaritalStatus}
                  helperText={errors.buyerMaritalStatus?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...register("buyerOccupation", {
                    required: "Profissão é obrigatória",
                  })}
                  label="Profissão"
                  fullWidth
                  error={!!errors.buyerOccupation}
                  helperText={errors.buyerOccupation?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...register("buyerAddress", {
                    required: "Endereço é obrigatório",
                  })}
                  label="Endereço"
                  fullWidth
                  error={!!errors.buyerAddress}
                  helperText={errors.buyerAddress?.message}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Detalhes do veículo
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  {...register("vehicleBrand", {
                    required: "Marca é obrigatória",
                  })}
                  label="Marca"
                  fullWidth
                  error={!!errors.vehicleBrand}
                  helperText={errors.vehicleBrand?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  {...register("vehicleModel", {
                    required: "Modelo é obrigatório",
                  })}
                  label="Modelo"
                  fullWidth
                  error={!!errors.vehicleModel}
                  helperText={errors.vehicleModel?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  {...register("licensePlate", {
                    required: "Placa é obrigatória",
                  })}
                  label="Placa"
                  fullWidth
                  error={!!errors.licensePlate}
                  helperText={errors.licensePlate?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  {...register("vehicleColor", {
                    required: "Cor é obrigatória",
                  })}
                  label="Cor"
                  fullWidth
                  error={!!errors.vehicleColor}
                  helperText={errors.vehicleColor?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  {...register("vehicleYear", {
                    required: "Ano é obrigatório",
                    min: { value: 1900, message: "Ano inválido" },
                    max: {
                      value: new Date().getFullYear() + 1,
                      message: "Ano inválido",
                    },
                  })}
                  label="Ano"
                  type="number"
                  fullWidth
                  error={!!errors.vehicleYear}
                  helperText={errors.vehicleYear?.message}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Valores e parcelas
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...register("carPrice", {
                    required: "Valor é obrigatório",
                    min: { value: 0, message: "Valor inválido" },
                  })}
                  label="Valor (R$)"
                  type="number"
                  fullWidth
                  error={!!errors.carPrice}
                  helperText={errors.carPrice?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...register("carPriceInWords", {
                    required: "Valor por extenso é obrigatório",
                  })}
                  label="Valor por extenso"
                  fullWidth
                  error={!!errors.carPriceInWords}
                  helperText={errors.carPriceInWords?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  {...register("numberOfInstallments", {
                    required: "Parcelas é obrigatório",
                    min: { value: 1, message: "Mínimo 1 parcela" },
                  })}
                  label="Nº de parcelas"
                  type="number"
                  fullWidth
                  error={!!errors.numberOfInstallments}
                  helperText={errors.numberOfInstallments?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  {...register("installmentValue", {
                    required: "Valor é obrigatório",
                    min: { value: 0, message: "Valor inválido" },
                  })}
                  label="Valor da parcela (R$)"
                  type="number"
                  fullWidth
                  error={!!errors.installmentValue}
                  helperText={errors.installmentValue?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  {...register("installmentValueInWords", {
                    required: "Valor por extenso é obrigatório",
                  })}
                  label="Parcelas por extenso"
                  fullWidth
                  error={!!errors.installmentValueInWords}
                  helperText={errors.installmentValueInWords?.message}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Data do contrato
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...register("contractDay", {
                    required: "Dia é obrigatório",
                    min: { value: 1, message: "Dia inválido" },
                    max: { value: 31, message: "Dia inválido" },
                  })}
                  label="Dia"
                  type="number"
                  fullWidth
                  error={!!errors.contractDay}
                  helperText={errors.contractDay?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...register("contractDate", {
                    required: "Data é obrigatória",
                  })}
                  label="Data"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.contractDate}
                  helperText={errors.contractDate?.message}
                />
              </Grid>
            </Grid>
          </form>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Resumo do contrato
              </Typography>
              <Typography>
                Você está prestes a gerar um contrato usando o modelo:{" "}
                <strong>{selectedTemplate}</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Revise todas as informações antes de gerar o contrato. Ao clicar
                em "Gerar contrato", você será solicitado a escolher onde salvar
                o arquivo.
              </Typography>
            </Paper>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Card variant="outlined" sx={{ mt: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
            Gerador de contratos
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {getStepContent(activeStep)}

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            {activeStep > 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Voltar
              </Button>
            )}
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={activeStep === 0 && !selectedTemplate}
              >
                Próximo
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit(onSubmit)}
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? "Gerando..." : "Gerar contrato"}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      <Snackbar open={alert.open} autoHideDuration={6000} onClose={closeAlert}>
        <Alert
          onClose={closeAlert}
          severity={alert.severity}
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ContractGenerator;
