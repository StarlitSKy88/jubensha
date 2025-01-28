import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import {
  fetchQuestionnaire,
  submitAnswers,
  getAnalysis,
  selectQuestions,
  selectAnswers,
  selectCurrentStep,
  selectTotalSteps,
  selectAnalysis,
  selectLoading,
  selectError,
  setAnswer,
  nextStep,
  prevStep
} from '../../store/slices/questionnaireSlice';
import {
  Box,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress,
  Alert
} from '@mui/material';

const QuestionnaireForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const questions = useSelector(selectQuestions);
  const answers = useSelector(selectAnswers);
  const currentStep = useSelector(selectCurrentStep);
  const totalSteps = useSelector(selectTotalSteps);
  const analysis = useSelector(selectAnalysis);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  useEffect(() => {
    dispatch(fetchQuestionnaire());
  }, [dispatch]);

  const handleAnswer = (questionId: string, value: string) => {
    dispatch(setAnswer({ questionId, answer: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      dispatch(nextStep());
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    dispatch(prevStep());
  };

  const handleSubmit = async () => {
    try {
      await dispatch(submitAnswers(answers)).unwrap();
      await dispatch(getAnalysis()).unwrap();
    } catch (err) {
      console.error('Failed to submit questionnaire:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (analysis) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>分析结果</Typography>
        <Typography variant="body1" paragraph>{analysis.summary}</Typography>
        {analysis.recommendations && (
          <>
            <Typography variant="h5" gutterBottom>建议</Typography>
            <ul>
              {analysis.recommendations.map((rec, index) => (
                <li key={index}>
                  <Typography variant="body1">{rec}</Typography>
                </li>
              ))}
            </ul>
          </>
        )}
      </Box>
    );
  }

  const currentQuestion = questions[currentStep];

  return (
    <Box sx={{ p: 3 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
        {questions.map((_, index) => (
          <Step key={index}>
            <StepLabel>问题 {index + 1}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {currentQuestion && (
        <Box sx={{ mt: 4 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">
              <Typography variant="h6">{currentQuestion.content}</Typography>
            </FormLabel>
            <RadioGroup
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
            >
              {currentQuestion.options.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
          </FormControl>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              上一步
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
            >
              {currentStep === totalSteps - 1 ? '提交' : '下一步'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default QuestionnaireForm;

