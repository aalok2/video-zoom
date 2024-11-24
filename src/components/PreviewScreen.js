import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { openDB } from "idb";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import Draggable from "react-draggable";
import { IconButton, SwipeableDrawer, TextField, Button ,Typography} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { ChromePicker } from "react-color";
import Header from "./header";
import { red } from "@mui/material/colors";
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
  pointer-events: none;
`;

const BlockForm = styled.div`
  margin-top: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
`;
const RegionList = styled.ul`
  list-style-type: none;
  padding: 0;
`;
const RegionItem = styled.li`
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
    background-color: #f5f5f5;
  }
`;
const ColorDisplay = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  background-color: ${(props) => props.color};
  border-radius: 50%;
  margin-right: 8px;
  border: 1px solid #ccc;
`;
const RegionInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
   font-size: 0.85rem
`;
const RegionDetails = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  font-size: 0.85rem
`;

const RegionText = styled(Typography)`
  font-size: 0.4rem; /* Decrease font size */
`;
const PreviewScreen = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [endTime, setEndTime] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [regions, setRegions] = useState([]);
 const [isDrawerOpen, setIsDrawerOpen] = useState(false);
   const [formValues, setFormValues] = useState({
    startTime: 0,
    endTime: 0,
    xCoordinate: 0,
    yCoordinate: 0,
    color: "#ffffff",
    zoomScale: 1,
  });
  // const [zoomLevel, setZoomLevel] = useState(1);
  // const [zoomX, setZoomX] = useState(50); // Centered initially
  // const [zoomY, setZoomY] = useState(50); // Centered initially
  

  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const endTimeRef = useRef(endTime);
  // const zoomIntervalsRef = useRef(regions)

  useEffect(() => {
    endTimeRef.current = endTime;
  }, [endTime]);

  //   useEffect(() => {
  //   zoomIntervalsRef.current = regions;
  // }, [regions]);

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

  //   useEffect(() => {
  //   const video = videoRef.current;

  //   if (video) {
  //     video.addEventListener('timeupdate', handleTimeUpdate);
  //   }

  //   return () => {
  //     if (video) {
  //       video.removeEventListener('timeupdate', handleTimeUpdate);
  //     }
  //   };
  // }, []);

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

const handleRegionLeftDrag = (e, data, index) => {
    setRegions((prevItems) =>
      prevItems.map((item) =>
        item.id === index ? { ...item, startTime:(data.x / 700) * duration  } : item
      )
    );
    console.log("After" , regions)
  };
const handleRegionRightDrag = (e, data, index) => {
    setRegions((prevItems) =>
      prevItems.map((item) =>
        item.id === index ? { ...item, endTime:(data.x / 700) * duration  } : item
      )
    );
  };

  const handleDrawerToggle = () => {
    setIsDrawerOpen((prev) => !prev);
  };

    const handleInputChange = (field, value) => {
    setFormValues((prevValues) => ({ ...prevValues, [field]: value }));
  };
  
  const handleSaveRegion = () => {
    const newRegion = {
      id: regions.length + 1,
      ...formValues,
    };
     setRegions([...regions, newRegion]);
    setIsDrawerOpen(false);
    setFormValues({
      startTime: 0,
      endTime: 0,
      xCoordinate: 0,
      yCoordinate: 0,
      color: "#ffffff",
      zoomScale: 1,
    });
  };
   const handleDeleteRegion = (id) => {
    setRegions(regions.filter((region) => region.id !== id));
  };
  const fetchLeftThreshold = (id) => {
    const foundIndex = regions.sort((a,b) =>  a.startTime - b.startTime).findIndex(region => region.id == id)
    //  console.log(regions[foundIndex-1])
    return foundIndex > 1? Math.floor(regions[foundIndex-1].endTime) : 0
  }
    const fetchRightThreshold = (id) => {
    const foundIndex = regions.sort((a,b) =>  a.startTime - b.startTime).findIndex(region => region.id == id)
    return foundIndex > 1? Math.floor(regions[foundIndex+1].startTime) : 700
   
  }
  //   const applyZoomForCurrentTime = (time) => {
  //    console.log(Math.floor(time)) 
  //    console.log(regionsRef.current)
  //   const activeRegion = regionsRef.current.find((region) => time >= region.startTime && time <= region.endTime);
  //   console.log(activeRegion)
  //   if (activeRegion) {
  //     const videoElement = videoRef.current;
  //     videoElement.style.transform = `scale(${activeRegion.zoomScale})`;
  //     videoElement.style.transformOrigin = `${activeRegion.xCoordinate}% ${activeRegion.yCoordinate}%`;
  //   } else {
  //     videoRef.current.style.transform = "scale(1)";
  //   }
  // };
  //  const handleTimeUpdate = () => {
  //   if (videoRef.current) {
  //     const currentTime = videoRef.current.currentTime;
  //     const intCurrentTime = Math.floor(currentTime)
  //     // Find the zoom level and coordinates for the current time using zoomIntervalsRef

  //     const currentInterval = zoomIntervalsRef.current.find(
  //       (interval) => intCurrentTime >= interval.startTime && intCurrentTime < interval.endTime
  //     );
  //     console.log(currentInterval)
  //     if (currentInterval) {
  //       setZoomLevel(currentInterval.zoomScale);
  //       setZoomX(currentInterval.xCoordinate);
  //       setZoomY(currentInterval.yCoordinate);
  //     }
  //   }
  // };

  return (
    <div>
      <Header/>
    <Container>
      <VideoContainer>
        {videoUrl ? (
          <video ref={videoRef} className="video-js vjs-default-skin" controls>
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <p>Loading video...</p>
        )}

  <TimelineContainer>
 <div style={{ position: "relative", height: "40px", width: "100%" }}>
      {regions.map((region, index) => {
        const { startTime, endTime, color } = region;

        return (
          <SelectedArea
            key={index}
            style={{
              left: `${(startTime / duration) * 100}%`,
              width: `${((endTime - startTime) / duration) * 100}%`,
              backgroundColor: color || "rgba(108, 99, 255, 0.4)", // Default color if no color is provided
            }}
          />
        );
      })}
        {/* <Draggable
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
        </Draggable> */}
        {regions.length === 0 ? (
        // Only two draggable pointers when no regions
        <>
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
        </>
      ) : (
        // Default pointers at start and end, plus additional ones based on `regions`
        <>
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

          {/* Pointers based on regions */}
          {regions.map((region)=>  {
            return(       <div>
              {/* Left pointer for each region */}
              <Draggable
                axis="x"
                bounds={{
                  left:0,
                  right: (region.endTime / duration) * 700,
                }}
                position={{ x: (region.startTime / duration) * 700, y: 0 }}
                onDrag={(e, data) => handleRegionLeftDrag(e, data, region.id)}
              >
                <Pointer style={{ backgroundColor: region.color || "#1086FF" }}>
                  <TimeDisplay>{Math.floor(region.startTime)}s</TimeDisplay>
                </Pointer>
              </Draggable>

              {/* Right pointer for each region */}
              <Draggable
                axis="x"
                bounds={{
                  left: (region.startTime / duration) * 700,
                  right:700,
                }}
                position={{ x: (region.endTime / duration) * 700, y: 0 }}
                onDrag={(e, data) => handleRegionRightDrag(e, data, region.id)}
              >
                <Pointer style={{ backgroundColor: region.color || "#ff6363" }}>
                  <TimeDisplay>{Math.floor(region.endTime)}s</TimeDisplay>
                </Pointer>
              </Draggable>
            </div>)
          })            
          }
        </>
      )}
      </div>
      </TimelineContainer>

        <ButtonContainer>
          <StyledButton onClick={togglePlayPause}>
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </StyledButton>
          <StyledButton onClick={handleDrawerToggle}>
            <AddIcon />
          </StyledButton>
        </ButtonContainer>

  <SwipeableDrawer
        anchor="right"
          open={isDrawerOpen}
          onClose={handleDrawerToggle}
          onOpen={handleDrawerToggle}
        >
         <div style={{ padding: "20px", width: "300px" }}>
            <h3>Add Zoom Block</h3>
            <TextField
              type="number"
              label="Start Time"
              value={formValues.startTime}
              onChange={(e) => handleInputChange("startTime", e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              type="number"
              label="End Time"
              value={formValues.endTime}
              onChange={(e) => handleInputChange("endTime", e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              type="number"
              label="X Coordinate"
              value={formValues.xCoordinate}
              onChange={(e) =>
                handleInputChange("xCoordinate", e.target.value)
              }
              fullWidth
              margin="normal"
            />
            <TextField
              type="number"
              label="Y Coordinate"
              value={formValues.yCoordinate}
              onChange={(e) =>
                handleInputChange("yCoordinate", e.target.value)
              }
              fullWidth
              margin="normal"
            />
            <div style={{ margin: "20px 0" }}>
              <ChromePicker
                color={formValues.color}
                onChange={(color) => handleInputChange("color", color.hex)}
              />
            </div>
            <TextField
              type="number"
              label="Zoom Scale"
              value={formValues.zoomScale}
              onChange={(e) => handleInputChange("zoomScale", e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveRegion}
            >
              Save
            </Button>
        <h2>Added Regions</h2>
            <RegionList>
    {regions.map((region) => (
      <RegionItem key={region.id}>
        <RegionDetails>
          <RegionInfo>
        <RegionText variant="body1">Start: {region.startTime}s, End: {region.endTime}s </RegionText>
        <RegionText variant="body1">Zoom: {region.zoomScale}</RegionText>
                    </RegionInfo>
        <ColorDisplay color={region.color} />
        </RegionDetails>
        <IconButton onClick={() => handleDeleteRegion(region.id)} color="error">
          <DeleteIcon />
        </IconButton>
      </RegionItem>
    ))}
  </RegionList>
              </div>
       </SwipeableDrawer>
      </VideoContainer>
    </Container>
    </div>
  );
};

export default PreviewScreen;