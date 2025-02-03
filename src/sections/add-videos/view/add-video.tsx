/* eslint-disable react/button-has-type */
import axios from 'axios';
import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';

import { Box, Alert, Button, Snackbar, TextField, Grid } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';

interface Video {
  id: number;
  title: string;
  youtube_channel: string;
}

const AddVideoView = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [newVideo, setNewVideo] = useState({ title: '', youtube_channel: '' });
  const [showForm, setShowForm] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  console.log("🚀 ~ AddVideoView ~ token:", token)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleInputChange = (field: keyof typeof newVideo, value: string) => {
    setNewVideo({ ...newVideo, [field]: value });
  };

  useEffect(() => {
    const user = Cookies.get('user') ? JSON.parse(Cookies.get('user') || '{}') : null;
    if (user?.token) {
      setToken(user.token);
    }
  }, []);

  const handleSubmit = async () => {
    if (!newVideo.title.trim() || !newVideo.youtube_channel.trim()) {
      setSnackbar({
        open: true,
        message: 'Please fill both title and YouTube URL fields',
        severity: 'error',
      });
      return;
    }

    try {
      await axios.post(`${BASE_URL}/v1/how-it-works/add`, newVideo, {
        headers: {
          'x-api-key': X_API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });
      setSnackbar({ open: true, message: 'Video added successfully', severity: 'success' });
      setNewVideo({ title: '', youtube_channel: '' });
      setShowForm(false);
      fetchVideos();
    } catch (error) {
      console.error('Error posting video:', error);
      setSnackbar({ open: true, message: 'Failed to add video', severity: 'error' });
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/v1/how-it-works/list`, {
        headers: { 'x-api-key': X_API_KEY },
      });
      setVideos(response.data.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const handleDeleteVideo = async (videoId: number) => {
    try {
      await axios.delete(`${BASE_URL}/v1/how-it-works/${videoId}`, {
        headers: {
          'x-api-key': X_API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });
      setSnackbar({ open: true, message: 'Video deleted successfully', severity: 'success' });
      fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      setSnackbar({ open: true, message: 'Failed to delete video', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const convertToEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  return (
    <section className="py-4">
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <div className="container mx-auto px-4">
        <div className="text-left mb-12 pl-2">
          <h1 className="font-bold text-5xl text-purple-800 mb-6">How It Works Videos</h1>
          <p className="text-gray-700">Manage instructional videos for the platform.</p>
        </div>
        <Box display="flex" alignItems="end" justifyContent="end" mb={5}>
          <Button
            variant="contained"
            color={showForm ? 'error' : 'inherit'}
            startIcon={showForm ? '' : <Iconify icon="mingcute:add-line" />}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Close' : 'Add New Video'}
          </Button>
        </Box>
        {showForm && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-100">
            <div className="mb-4">
              <TextField
                fullWidth
                label="Title"
                variant="outlined"
                value={newVideo.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="mb-4 bg-white rounded-xl"
              />
              <br />
              <br />
              <TextField
                fullWidth
                label="YouTube URL"
                variant="outlined"
                value={newVideo.youtube_channel}
                onChange={(e) => handleInputChange('youtube_channel', e.target.value)}
                className="bg-white rounded-xl"
                helperText="Paste the full YouTube URL (e.g., https://www.youtube.com/watch?v=...)"
              />
              <br />
              <br />
              <Button
                variant="contained"
                sx={{ bgcolor: '#4A2D6F', mt: 2 }}
                onClick={handleSubmit}
                className="mt-4"
              >
                Add Video
              </Button>
            </div>
          </div>
        )}
        {videos.length === 0 ? (
          <Alert severity="info" sx={{ width: '100%', mt: 2 }}>
            No videos available
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {videos?.map((video, index) => (
              <Grid item xs={12} md={6} lg={4} key={video.id}>
                <Box
                  sx={{
                    mt: 2,
                    bgcolor: 'white',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    padding: '16px',
                    position: 'relative',
                  }}
                >
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Iconify icon="mingcute:delete-line" />}
                    onClick={() => handleDeleteVideo(video.id)}
                    sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                  >
                    Delete
                  </Button>
                  <div style={{ fontSize: '18px', marginBottom: '10px', color: '#462F6A' }}>
                    <b>
                      <span style={{ color: '#EA0F0E', fontSize: '20px' }}>{index + 1}</span> -{' '}
                      {video.title}
                    </b>
                  </div>
                  <iframe
                    width="100%"
                    height="250"
                    src={convertToEmbedUrl(video.youtube_channel)}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </div>
    </section>
  );
};

export default AddVideoView;
