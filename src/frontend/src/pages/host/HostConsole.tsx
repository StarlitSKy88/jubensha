import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import {
  fetchGameState,
  revealClue,
  startPhase,
  updatePlayerStatus,
  selectPlayers,
  selectClues,
  selectGamePhases,
  selectCurrentPhase,
  selectTimeRemaining,
  selectLoading,
  selectError
} from '../../store/slices/hostSlice';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PlayArrow,
  Stop
} from '@mui/icons-material';

const HostConsole: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const players = useSelector(selectPlayers);
  const clues = useSelector(selectClues);
  const gamePhases = useSelector(selectGamePhases);
  const currentPhase = useSelector(selectCurrentPhase);
  const timeRemaining = useSelector(selectTimeRemaining);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  useEffect(() => {
    if (gameId) {
      dispatch(fetchGameState(gameId));
      const interval = setInterval(() => {
        dispatch(fetchGameState(gameId));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [dispatch, gameId]);

  const handleRevealClue = async (clueId: string) => {
    if (gameId) {
      try {
        await dispatch(revealClue({ gameId, clueId })).unwrap();
      } catch (err) {
        console.error('Failed to reveal clue:', err);
      }
    }
  };

  const handleStartPhase = async (phaseId: string) => {
    if (gameId) {
      try {
        await dispatch(startPhase({ gameId, phaseId })).unwrap();
      } catch (err) {
        console.error('Failed to start phase:', err);
      }
    }
  };

  const handleUpdatePlayerStatus = async (playerId: string, status: string) => {
    if (gameId) {
      try {
        await dispatch(updatePlayerStatus({ gameId, playerId, status })).unwrap();
      } catch (err) {
        console.error('Failed to update player status:', err);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>当前阶段</Typography>
              {currentPhase && (
                <>
                  <Typography variant="h6">{currentPhase.name}</Typography>
                  <Typography variant="body1">{currentPhase.description}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    剩余时间: {timeRemaining !== null ? formatTime(timeRemaining) : '--:--'}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>游戏阶段</Typography>
            <List>
              {gamePhases.map((phase) => (
                <ListItem key={phase.id}>
                  <ListItemText
                    primary={phase.name}
                    secondary={phase.description}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleStartPhase(phase.id)}
                      disabled={phase.id === currentPhase?.id}
                    >
                      {phase.id === currentPhase?.id ? <Stop /> : <PlayArrow />}
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>玩家状态</Typography>
              <List>
                {players.map((player) => (
                  <ListItem key={player.id}>
                    <ListItemText
                      primary={player.username}
                      secondary={`状态: ${player.status}`}
                    />
                    <ListItemSecondaryAction>
                      <Button
                        size="small"
                        onClick={() => handleUpdatePlayerStatus(player.id, player.status === 'active' ? 'inactive' : 'active')}
                      >
                        {player.status === 'active' ? '禁用' : '启用'}
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>线索管理</Typography>
              <List>
                {clues.map((clue) => (
                  <ListItem key={clue.id}>
                    <ListItemText
                      primary={clue.content}
                      secondary={`目标玩家: ${clue.targetPlayer}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleRevealClue(clue.id)}
                      >
                        {clue.isRevealed ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HostConsole; 