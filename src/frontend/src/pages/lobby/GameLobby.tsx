import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import {
  fetchRooms,
  createRoom,
  joinRoom,
  selectRooms,
  selectRoomError,
  selectRoomLoading
} from '../../store/slices/roomSlice';
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import { Add } from '@mui/icons-material';

interface CreateRoomForm {
  name: string;
  maxPlayers: number;
  gameType: string;
}

const GameLobby: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const rooms = useSelector(selectRooms);
  const error = useSelector(selectRoomError);
  const loading = useSelector(selectRoomLoading);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateRoomForm>({
    name: '',
    maxPlayers: 8,
    gameType: 'standard'
  });

  useEffect(() => {
    dispatch(fetchRooms());
    const interval = setInterval(() => {
      dispatch(fetchRooms());
    }, 10000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleCreateRoom = async () => {
    try {
      const result = await dispatch(createRoom(formData)).unwrap();
      setIsCreateDialogOpen(false);
      navigate(`/room/${result.id}`);
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    try {
      await dispatch(joinRoom(roomId)).unwrap();
      navigate(`/room/${roomId}`);
    } catch (err) {
      console.error('Failed to join room:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxPlayers' ? parseInt(value, 10) : value
    }));
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">游戏大厅</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          创建房间
        </Button>
      </Box>

      <Grid container spacing={3}>
        {rooms.map((room) => (
          <Grid item xs={12} sm={6} md={4} key={room.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{room.name}</Typography>
                <Typography color="textSecondary">
                  玩家数: {room.playerCount}/{room.maxPlayers}
                </Typography>
                <Typography color="textSecondary">
                  游戏类型: {room.gameType}
                </Typography>
                <Typography color="textSecondary">
                  状态: {room.status}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleJoinRoom(room.id)}
                  disabled={room.playerCount >= room.maxPlayers || room.status === 'playing'}
                >
                  加入房间
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)}>
        <DialogTitle>创建新房间</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="房间名称"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="maxPlayers"
            label="最大玩家数"
            type="number"
            fullWidth
            value={formData.maxPlayers}
            onChange={handleChange}
            inputProps={{ min: 2, max: 12 }}
          />
          <TextField
            margin="dense"
            name="gameType"
            label="游戏类型"
            type="text"
            fullWidth
            value={formData.gameType}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>取消</Button>
          <Button onClick={handleCreateRoom} variant="contained">
            创建
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GameLobby; 