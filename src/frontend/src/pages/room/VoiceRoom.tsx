import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import {
  joinVoiceRoom,
  leaveVoiceRoom,
  toggleMicrophone,
  toggleVolume,
  selectParticipants,
  selectIsMicrophoneEnabled,
  selectIsVolumeEnabled,
  selectLoading,
  selectError
} from '../../store/slices/voiceSlice';
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Mic,
  MicOff,
  VolumeUp,
  VolumeOff,
  ExitToApp
} from '@mui/icons-material';

const VoiceRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const participants = useSelector(selectParticipants);
  const isMicEnabled = useSelector(selectIsMicrophoneEnabled);
  const isVolumeEnabled = useSelector(selectIsVolumeEnabled);
  const error = useSelector(selectError);
  const loading = useSelector(selectLoading);

  useEffect(() => {
    if (roomId) {
      dispatch(joinVoiceRoom(roomId));
    }
    return () => {
      if (roomId) {
        dispatch(leaveVoiceRoom(roomId));
      }
    };
  }, [dispatch, roomId]);

  const handleToggleMic = () => {
    dispatch(toggleMicrophone());
  };

  const handleToggleVolume = () => {
    dispatch(toggleVolume());
  };

  const handleLeaveRoom = () => {
    if (roomId) {
      dispatch(leaveVoiceRoom(roomId));
    }
    navigate('/lobby');
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
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error.toString()}</Alert>}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">语音房间</Typography>
        <Box>
          <IconButton onClick={handleToggleMic}>
            {isMicEnabled ? <Mic /> : <MicOff />}
          </IconButton>
          <IconButton onClick={handleToggleVolume}>
            {isVolumeEnabled ? <VolumeUp /> : <VolumeOff />}
          </IconButton>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<ExitToApp />}
            onClick={handleLeaveRoom}
          >
            离开房间
          </Button>
        </Box>
      </Box>
      <List>
        {participants.map((participant) => (
          <ListItem key={participant.id}>
            <ListItemAvatar>
              <Avatar src={participant.avatar} alt={participant.username} />
            </ListItemAvatar>
            <ListItemText
              primary={participant.username}
              secondary={participant.isSpeaking ? '正在说话' : ''}
            />
            {participant.isMuted && (
              <MicOff color="disabled" />
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default VoiceRoom; 