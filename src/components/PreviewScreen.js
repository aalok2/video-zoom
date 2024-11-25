import React, { useDebugValue, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { openDB } from "idb";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import Draggable from "react-draggable";
import {
  IconButton,
  SwipeableDrawer,
  TextField,
  Button,
  Typography,
} from "@mui/material";	
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { ChromePicker } from "react-color";
import Header from "./header";
import { red } from "@mui/material/colors";
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  background-color: #e3edf7; /* Replace with your chosen color */
`;

// const width = (90 /100 * ( window.innerWidth) -18)
// console.log(width)
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
  max-width: 666px;
  width: 100%;
  height: 500px;
`;

const TimelineContainer = styled.div`
  display: flex;
  align-items: center;
  width: 90%;
  height: 60px;
  margin-top: 20px;
  background-color: #e0e0e0;
  border-radius: 5px;
  padding-left: 20px;
`;

const Pointer = styled.div`
  position: absolute;
  height: 120%;
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
  justify-content: center;
  margin-top: 30px;
  margin-left: 30px;
  margin-bottom: 20px;
  padding-right: 20px;
`;

const StyledButton = styled(IconButton)`
  background-color: #6c63ff !important;
  color: white !important;
  &:hover {
    background-color: #5a52e0 !important;
  }
  width: 40px;
  height: 40px;
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
  width: 14px;
  height: 14px;
  background-color: ${(props) => props.color};
  border-radius: 50%;
  margin-right: 8px;
  border: 1px solid #ccc;
  border-left:1px
`;
const RegionInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2px;
`;
const RegionDetails = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
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
    id: 0,
  });
  const [zoomStyle, setZoomStyle] = useState(null);
  const [width, setWindowWidth] = useState(0);
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const endTimeRef = useRef(endTime);
  const timeLineWidthRef = useRef(null);

  useEffect(() => {
    endTimeRef.current = endTime;
  }, [endTime]);


  const updateWidth = () => {
    if (timeLineWidthRef) {
      setWindowWidth(
        timeLineWidthRef.current.getBoundingClientRect().width - 20
      );
    }
  };
  useEffect(() => {
    updateWidth();

    console.log(width);

    window.addEventListener("resize", updateWidth);

    return () => window.removeEventListener("resize", updateWidth);
  }, []);

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
        width: 700,
        height: 450,
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
      playerRef.current.on("pause", () => {
        setIsPlaying(false);
      });
      playerRef.current.on("play", () => {
        setIsPlaying(true);
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
    const newTime = Math.min((data.x / width) * duration, endTime - 0.1);
    if (newTime < endTime) {
      setCurrentTime(newTime);
    }

    if (playerRef.current) {
      playerRef.current.currentTime(newTime);
    }
  };

  const handleDragRight = (e, data) => {
    const newEndTime = Math.max((data.x / width) * duration, currentTime + 0.1);
    setEndTime((newEndTime));
  };

  const handleRegionLeftDrag = (e, data, index) => {
    setRegions((prevItems) => {
      const sortedRegions = [...prevItems].sort(
        (a, b) => a.startTime - b.startTime
      );

      const currentIndex = sortedRegions.findIndex((item) => item.id === index);

      const previousEndTime =
        currentIndex > 0 ? sortedRegions[currentIndex - 1].endTime : null;

      const newStartTime = (data.x / width) * duration;

      console.log(newStartTime <= previousEndTime);
      if (previousEndTime !== null && newStartTime <= previousEndTime) {
        console.log("Overlap detected with the previous region's endTime.");
        return prevItems;
      }
      return prevItems.map((item) =>
        item.id === index
          ? { ...item, startTime: (data.x / width) * duration }
          : item
      );
    });
  };

  const handleRegionRightDrag = (e, data, index) => {
    setRegions((prevItems) => {
      const sortedRegions = [...prevItems].sort(
        (a, b) => a.startTime - b.startTime
      );

      const currentIndex = sortedRegions.findIndex((item) => item.id === index);

      console.log(currentIndex);

    const nextStartTime = currentIndex >=0 ? currentIndex+ 1 < sortedRegions.length ? sortedRegions[currentIndex + 1].startTime : null : null;

      const newStartTime = (data.x / width) * duration;

      if (nextStartTime !== null && newStartTime >= nextStartTime) {
        console.log("Overlap detected with the previous region's endTime.");
        return prevItems;
      }
      return prevItems.map((item) =>
        item.id === index
          ? { ...item, endTime: (data.x / width) * duration }
          : item
      );
    });
  };

  const handleDrawerToggle = () => {
    setIsDrawerOpen((prev) => !prev);
  };
  const handleInputChange = (field, value) => {
    console.log("Field", field, "value", value);
    setFormValues((prevValues) => ({ ...prevValues, [field]: value }));
  };


  const handleSaveRegion = (formValues) => {
    console.log("Form Values:", formValues);
    setRegions((regions) => {
      console.log("Previous Regions:", regions);

      const regionFound = regions.find((region) => region.id === formValues.id);
      console.log("Region Found:", regionFound);

      if (regionFound) {
        return regions.map((region) =>
          region.id === formValues.id ? { ...region, ...formValues } : region
        );
      } else {
        const newRegion = { ...formValues, id: regions.length + 1 };
        console.log("New Region:", newRegion);
        return [...regions, newRegion];
      }
    });

    console.log("Drawer Closing and Form Reset");

    setIsDrawerOpen(false);
    setFormValues({
      startTime: 0,
      endTime: 0,
      xCoordinate: 0,
      yCoordinate: 0,
      color: "#ffffff",
      zoomScale: 1,
      id: 0,
    });
  };

  const handleDeleteRegion = (id) => {
    setRegions(regions.filter((region) => region.id !== id));
  };


  const handleZoomState = () => {
    const currTime = videoRef.current.currentTime;
    const activeBlock = regions.find(
      (region) => currTime >= region.startTime && currTime <= region.endTime
    );

    const styles = activeBlock
      ? {
          transformOrigin: "0 0",
          trnsform: `scale(${
            activeBlock.zoomScale
          }) translate(${-activeBlock.xCoordinate}px, ${-activeBlock.yCoordinate}px)`,
          width: `calc(100% + ${activeBlock.xCoordinate}px)`,
          height: `calc(100% + ${activeBlock.yCoordinate}px)`,
          objectFit: "cover",
        }
      : {
          transform: "none",
          transformOrigin: "center",
        };

    setZoomStyle(styles);
  };
  // const handleZoomState = () => {
  //   const currTime = videoRef.current.currentTime;
  //   const activeBlock = regions.find(
  //     (region) => currTime >= region.startTime && currTime <= region.endTime
  //   );

  //   const styles = activeBlock
  //     ? {
  //         transformOrigin: "0 0",
  //         transform: `scale(${activeBlock.zoomScale}) translate(${
  //           (0.5 - activeBlock.xCoordinate / 100) *
  //           (activeBlock.zoomScale - 1) *
  //           100
  //         }%, ${
  //           (0.5 - activeBlock.yCoordinate / 100) *
  //           (activeBlock.zoomScale - 1) *
  //           100
  //         }%)`,
  //         width: "100%",
  //         height: "100%",
  //         objectFit: "cover",
  //       }
  //     : {
  //         transform: "none",
  //         transformOrigin: "center",
  //       };

  //   setZoomStyle(styles);
  // };

  const handleDoubleClick = (e) => {
    const currTime = e.pageX;
    console.log(regions);
    const activeBlock = regions.find(
      (region) =>
        currTime >= (region.startTime / duration) * width &&
        currTime <= (region.endTime / duration) * width
    );
    if (activeBlock) {
      console.log("Activeblock", activeBlock);
      setFormValues(activeBlock);
      setIsDrawerOpen(true);
    }
  };

  return (
    <div backgroundColor='#e0e0e0'>
      <Header />
      <Container>
        <div
          className='video-mask'
          style={{ overflow: "hidden", width: "=80%", height: "80%" }}
        >
          {videoUrl ? (
            <video
              ref={videoRef}
              className='video-js vjs-default-skin'
              controls
              onTimeUpdate={handleZoomState}
              style={zoomStyle}
            >
              <source src={videoUrl} type='video/mp4' />
              Your browser does not support the video tag.
            </video>
          ) : (
            <p>Loading video...</p>
          )}
        </div>

        <SwipeableDrawer
          anchor='right'
          open={isDrawerOpen}
          onClose={handleDrawerToggle}
          onOpen={handleDrawerToggle}
        >
          <div style={{ padding: "20px", width: "300px" }}>
            <h3>Add Zoom Block</h3>
            <TextField
              type='text'
              label='Start Time'
              value={formValues.startTime}
              onChange={(e) => handleInputChange("startTime", e.target.value)}
              fullWidth
              margin='normal'
            />
            <TextField
              type='text'
              label='End Time'
              value={formValues.endTime}
              onChange={(e) => handleInputChange("endTime", e.target.value)}
              fullWidth
              margin='normal'
            />
            <TextField
              type='text'
              label='X Coordinate'
              value={formValues.xCoordinate}
              onChange={(e) => handleInputChange("xCoordinate", e.target.value)}
              fullWidth
              margin='normal'
            />
            <TextField
              type='text'
              label='Y Coordinate'
              value={formValues.yCoordinate}
              onChange={(e) => handleInputChange("yCoordinate", e.target.value)}
              fullWidth
              margin='normal'
            />
            <div style={{ margin: "20px 0" }}>
              <ChromePicker
                color={formValues.color}
                onChange={(color) => handleInputChange("color", color.hex)}
              />
            </div>
            <TextField
              type='text'
              label='Zoom Scale'
              value={formValues.zoomScale}
              onChange={(e) => handleInputChange("zoomScale", e.target.value)}
              fullWidth
              margin='normal'
            />
            <Button
              variant='contained'
              color='primary'
              onClick={() => handleSaveRegion(formValues)}
            >
              Save
            </Button>
            <h3>Zoom Regions Available</h3>
            <RegionList>
              {regions.map((region) => (
                <RegionItem key={region.id}>
                  <RegionDetails>
                    <RegionInfo style={{ padding: "2px" }}>
                    <RegionText style={{paddingRight:"5px" , display : "flex" , fontSize: "14px", fontWeight: "500" ,alignItems : "center" }} >Start: {Number(region.startTime).toFixed(2)}'s, End: {Number(region.endTime).toFixed(2)}'s , Zoom: {region.zoomScale} <ColorDisplay color={region.color}/> </RegionText>
                      
                    </RegionInfo>
                  </RegionDetails>
                  <IconButton
                    style={{ paddingTop: "1px" }}
                    onClick={() => handleDeleteRegion(region.id)}
                    color='error'
                  >
                    <DeleteIcon />
                  </IconButton>
                </RegionItem>
              ))}
            </RegionList>
          </div>
        </SwipeableDrawer>
      </Container>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#e3edf7",
        }}
      >
        <TimelineContainer
          onDoubleClick={(e) => handleDoubleClick(e)}
          ref={timeLineWidthRef}
        >
          <div style={{ position: "relative", height: "60px", width: "100%" }}>
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
          bounds={{ left: 0, right: (endTime / duration) * width }}
          position={{ x: (currentTime / duration) * width, y: 0 }}
          onDrag={handleDragLeft}
        >
                   <Pointer style={{ height: "140%" }}>
            <TimeDisplay>{Math.floor(currentTime)}s</TimeDisplay>
          </Pointer>
        </Draggable>
        <Draggable
          axis="x"
          bounds={{ left: (currentTime / duration) * width, right: width }}
          position={{ x: (endTime / duration) * width, y: 0 }}
          onDrag={handleDragRight}
        >
          <Pointer style={{ backgroundColor: "#ff7f7f" }}>
            <TimeDisplay>{Math.floor(endTime)}s</TimeDisplay>
          </Pointer>
        </Draggable> */}
            {regions.length === 0 ? (
              // Only two draggable pointers when no regions
              <>
                <Draggable
                  axis='x'
                  bounds={{ left: 0, right: (endTime / duration) * width }}
                  position={{ x: (currentTime / duration) * width, y: 0 }}
                  onDrag={handleDragLeft}
                >
                  <Pointer style={{ backgroundColor: "#6c63ff" }}>
                    <TimeDisplay>{(currentTime).toFixed(2)}s</TimeDisplay>
                  </Pointer>
                </Draggable>
                <Draggable
                  axis='x'
                  bounds={{
                    left: (currentTime / duration) * width,
                    right: width,
                  }}
                  position={{ x: (endTime / duration) * width, y: 0 }}
                  onDrag={handleDragRight}
                >
                  <Pointer style={{ backgroundColor: "#ff7f7f" }}>
                    <TimeDisplay>{endTime.toFixed(2)}s</TimeDisplay>
                  </Pointer>
                </Draggable>
              </>
            ) : (
              <>
                <Draggable
                  axis='x'
                  bounds={{ left: 0, right: (endTime / duration) * width }}
                  position={{ x: (currentTime / duration) * width, y: 0 }}
                  onDrag={handleDragLeft}
                >
                  <Pointer style={{ backgroundColor: "#6c63ff" }}>
                    <TimeDisplay>{Math.floor(currentTime)}s</TimeDisplay>
                  </Pointer>
                </Draggable>
                <Draggable
                  axis='x'
                  bounds={{
                    left: (currentTime / duration) * width,
                    right: width,
                  }}
                  position={{ x: (endTime / duration) * width, y: 0 }}
                  onDrag={handleDragRight}
                >
                  <Pointer style={{ backgroundColor: "#ff7f7f" }}>
                    <TimeDisplay>{Math.floor(endTime)}s</TimeDisplay>
                  </Pointer>
                </Draggable>

                {/* Pointers based on regions */}
                {regions.map((region) => {
                  return (
                    <div>
                      {/* Left pointer for each region */}
                      <Draggable
                        axis='x'
                        bounds={{
                          left: 0,
                          right: (region.endTime / duration) * width,
                        }}
                        position={{
                          x: (region.startTime / duration) * width,
                          y: 0,
                        }}
                        onDrag={(e, data) =>
                          handleRegionLeftDrag(e, data, region.id)
                        }
                      >
                        <Pointer
                          style={{ backgroundColor: region.color || "#1086FF" }}
                        >
                        </Pointer>
                      </Draggable>


                      <Draggable
                        axis='x'
                        bounds={{
                          left: (region.startTime / duration) * width,
                          right: width,
                        }}
                        position={{
                          x: (region.endTime / duration) * width,
                          y: 0,
                        }}
                        onDrag={(e, data) =>
                          handleRegionRightDrag(e, data, region.id)
                        }
                      >
                        <Pointer
                          style={{ backgroundColor: region.color || "#ff7f7f" }}
                        >
                        </Pointer>
                      </Draggable>
                    </div>
                  );
                })}
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
      </div>
    </div>
  );
};

export default PreviewScreen;
