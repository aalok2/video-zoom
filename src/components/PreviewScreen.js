import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { openDB } from "idb";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import Draggable from "react-draggable";
import { IconButton, Drawer, TextField, Button } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import AddIcon from "@mui/icons-material/Add";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f2f5;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
`;

const VideoContainer = styled.div`
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: center;
  max-width: 700px;
  width: 100%;
  height: 500px;
`;

const TimelineContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  margin-top: 20px;
  background-color: #e0e0e0;
  border-radius: 5px;
`;

const Pointer = styled.div`
  position: absolute;
  height: 140%;
  width: 3px;
  background-color: #6c63ff;
  cursor: pointer;
`;

const TimeDisplay = styled.div`
  position: absolute;
  bottom: -20px;
  color: #333;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  width: 40px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 15px;
  justify-content: left;
  margin-top: 40px;
  margin-left: 40px;
  margin-bottom: 40px;
`;

const StyledButton = styled(IconButton)`
  background-color: #6c63ff !important;
  color: white !important;
  &:hover {
    background-color: #5a52e0 !important;
  }
  width: 50px;
  height: 50px;
`;

const SelectedArea = styled.div`
  position: absolute;
  height: 100%;
  background-color: rgba(108, 99, 255, 0.4);
  pointer-events: none;
`;

const DrawerContainer = styled.div`
  width: 300px;
  padding: 20px;
`;
const SideTray = styled.div`
  position: absolute;
  top: 20px;
  right: ${({ isOpen }) => (isOpen ? "0" : "-300px")};
  width: 300px;
  height: 100%;
  background-color: #f9f9f9;
  box-shadow: -4px 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;
`;

const PreviewScreen = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [endTime, setEndTime] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [regions, setRegions] = useState([]);
 const [isTrayOpen, setIsTrayOpen] = useState(false);
  const [blockStartTime, setBlockStartTime] = useState(0);
  const [blockEndTime, setBlockEndTime] = useState(0);
  const [blockKey, setBlockKey] = useState("");
const [zoomX, setZoomX] = useState(50); // Default X at center (50%)
const [zoomY, setZoomY] = useState(50); // Default Y at center (50%)
const [inputX, setInputX] = useState(50); // For user input
const [inputY, setInputY] = useState(50); // For user input
const [inputZoom, setInputZoom] = useState(1); // Default zoom factor for user input
  const [zoomLevel, setZoomLevel] = useState(1);
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const endTimeRef = useRef(endTime);

  useEffect(() => {
    endTimeRef.current = endTime;
  }, [endTime]);

  useEffect(() => {
    const fetchVideo = async () => {
      const db = await openDB("video-store", 1);
      const videoData = await db.get("videos", "uploadedVideo");

      if (videoData) {
        const url = URL.createObjectURL(videoData.file);
        setVideoUrl(url);
      } else {
        alert("No video uploaded.");
      }
    };

    fetchVideo();
  }, []);
   useEffect(() => {
    if (isPlaying) {
      const handleRealTimeZoom = () => {
        videoRef.current.style.transform = `scale(${zoomLevel})`;
        videoRef.current.style.transformOrigin = `${zoomX}% ${zoomY}%`;
      };

      handleRealTimeZoom();
    }
  }, [zoomLevel, zoomX, zoomY, isPlaying]);

  useEffect(() => {
    if (videoUrl && !playerRef.current) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        preload: "auto",
        width: 640,
        height: 360,
      });

      playerRef.current.on("loadedmetadata", () => {
        setDuration(playerRef.current.duration());
        setEndTime(playerRef.current.duration());
      });

      playerRef.current.on("timeupdate", () => {
        const current = playerRef.current.currentTime();
        if (current >= endTimeRef.current - 0.1) {
          playerRef.current.pause();
          setIsPlaying(false);
          setCurrentTime(endTimeRef.current);
        } else {
          setCurrentTime(current);
        }
      });
    }
  }, [videoUrl]);

  const togglePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDragLeft = (e, data) => {
    const newTime = Math.min((data.x / 700) * duration, endTime - 0.1);
    if (newTime < endTime) {
      setCurrentTime(newTime);
    }

    if (playerRef.current) {
      playerRef.current.currentTime(newTime);
    }
  };

   const handleDragRight = (e, data) => {
    const newEndTime = Math.max((data.x / 700) * duration, currentTime + 0.1);
    setEndTime(Math.floor(newEndTime));
  };

  const handleSaveBlock = () => {
    const newBlock = {
      key: blockKey,
      startTime: blockStartTime,
      endTime: blockEndTime,
    };

    setRegions([...regions, newBlock]);
    setIsTrayOpen(false);
    setBlockKey("");
  };
    const toggleTray = () => {
    setIsTrayOpen((prev) => !prev);
    if (!isTrayOpen) {
      setBlockStartTime(currentTime);
      setBlockEndTime(endTime);
    }
  };
 const handleXInputChange = (e) => {
  const x = Math.max(0, Math.min(100, Number(e.target.value))); // Clamp between 0-100%
  setInputX(x);
   setZoomX(x);
};

const handleYInputChange = (e) => {
  const y = Math.max(0, Math.min(100, Number(e.target.value))); // Clamp between 0-100%
  setInputY(y);
      setZoomY(y);
};
const applyZoomCoordinates = () => {
  setZoomX(inputX);
  setZoomY(inputY);
};
 const handleZoomInputChange = (e) => {
    const zoom = Math.max(1, Math.min(3, Number(e.target.value))); // Clamp between 1x and 3x
    setInputZoom(zoom);
    setZoomLevel(zoom);
  };



  return (
    <Container>
      <Title>Video Editor</Title>
      <VideoContainer>
       {videoUrl ? (
          <div className="video-mask" style={{ overflow: 'hidden', width: '=60%', height: '60%' }}>
            <video
              ref={videoRef}
              className="video-js vjs-default-skin"
              controls
              style={{
                transform: `scale(${zoomLevel}) translate(${(50 - zoomX) * (zoomLevel - 1)}%, ${(50 - zoomY) * (zoomLevel - 1)}%)`,
                transformOrigin: 'center',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          <p>Loading video...</p>
        )}
  <TimelineContainer>
                <SelectedArea
            style={{
              left: `${(currentTime / duration) * 100}%`,
              width: `${((endTime - currentTime) / duration) * 100}%`,
            }}
          />
        <Draggable
          axis="x"
          bounds={{ left: 0, right: (endTime / duration) * 700 }}
          position={{ x: (currentTime / duration) * 700, y: 0 }}
          onDrag={handleDragLeft}
        >
          <Pointer>
            <TimeDisplay>{Math.floor(currentTime)}s</TimeDisplay>
          </Pointer>
        </Draggable>
        <Draggable
          axis="x"
          bounds={{ left: (currentTime / duration) * 700, right: 700 }}
          position={{ x: (endTime / duration) * 700, y: 0 }}
          onDrag={handleDragRight}
        >
          <Pointer style={{ backgroundColor: "#ff6363" }}>
            <TimeDisplay>{Math.floor(endTime)}s</TimeDisplay>
          </Pointer>
        </Draggable>
      </TimelineContainer>

        <ButtonContainer>
          <StyledButton onClick={togglePlayPause}>
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </StyledButton>
          <StyledButton onClick={toggleTray}>
            <AddIcon />
          </StyledButton>
        </ButtonContainer>

        <SideTray isOpen={isTrayOpen}>
          <h3>Add Block</h3>
          <TextField
            label="Key"
            fullWidth
            margin="normal"
            value={blockKey}
            onChange={(e) => setBlockKey(e.target.value)}
          />
          <TextField
            label="Start Time"
            type="number"
            fullWidth
            margin="normal"
            value={blockStartTime}
            onChange={(e) => setBlockStartTime(Number(e.target.value))}
          />
          <TextField
            label="End Time"
            type="number"
            fullWidth
            margin="normal"
            value={blockEndTime}
            onChange={(e) => setBlockEndTime(Number(e.target.value))}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveBlock}
            style={{ marginTop: "20px" }}
          >
            Save
          </Button>
        </SideTray>
      </VideoContainer>
 <div>
          <label>
            Zoom Level (1-3x):
            <input
              type="number"
              value={inputZoom}
              onChange={handleZoomInputChange}
              step="0.1"
              min="1"
              max="3"
            />
          </label>
          <label>
            X Coordinate (0-100%):
            <input
              type="number"
              value={inputX}
              onChange={handleXInputChange}
            />
          </label>
          <label>
            Y Coordinate (0-100%):
            <input
              type="number"
              value={inputY}
              onChange={handleYInputChange}
            />
          </label>
        </div>

    </Container>
  );
};

export default PreviewScreen;