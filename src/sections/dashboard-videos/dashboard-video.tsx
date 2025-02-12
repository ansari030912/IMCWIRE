/* eslint-disable react/button-has-type */
import axios from 'axios';
import { useState, useEffect } from 'react';

import { Box, Grid, Alert } from '@mui/material';

import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';

interface Video {
  id: number;
  title: string;
  youtube_channel: string;
}

const DahboardVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);

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

  useEffect(() => {
    fetchVideos();
  }, []);

  const convertToEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  return (
    <section>
      {/* <div className="text-left mb-12 pl-2">
          <h1 className="font-bold text-5xl text-purple-800 mb-6">How It Works Videos</h1>
          <p className="text-gray-700">Instructional videos for the platform.</p>
        </div> */}

      {videos.length === 0 ? (
        <Alert severity="info" sx={{ width: '100%', mt: 2 }}>
          No videos available
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {videos?.slice(0, 3).map((video, index) => (
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
                <div style={{ fontSize: '18px', marginBottom: '10px', color: '#462F6A' }}>
                  <b>
                    <span style={{ color: '#75648F', fontSize: '20px' }}>{index + 1}</span> -{' '}
                    {video.title}
                  </b>
                </div>
                <iframe
                  width="100%"
                  height="250"
                  src={convertToEmbedUrl(video.youtube_channel)}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </section>
  );
};

export default DahboardVideos;
