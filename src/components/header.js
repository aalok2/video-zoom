import React from 'react';

const Header = () => {
  return (
    <div style={headerStyle}>
      {/* Left: Project Title */}
      <div style={projectTitleStyle}>Video Editor</div>

      {/* Right: Action Buttons */}
      {/* <div style={rightActionsStyle}>
        <button style={premiumButtonStyle}>Upgrade</button>
        <button style={relaunchButtonStyle}>Relaunch to Update</button>
      </div> */}
    </div>
  );
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 20px',
  color: '#000', // Adjust text color to match the background
  height: '80px',
  borderBottom: '0.2px  #444',
  backgroundImage: 'linear-gradient(to bottom, #f8e8a8, #d3d3d3)', // Light yellow to light gray gradient
};




const projectTitleStyle = {
  fontSize: '25px',
  fontWeight: 'bold',
  fontFamily : 'Lobster'
};

const rightActionsStyle = {
  display: 'flex',
  gap: '10px',
};

const premiumButtonStyle = {
  backgroundColor: 'gold',
  color: '#000',
  border: 'none',
  borderRadius: '5px',
  padding: '5px 10px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const relaunchButtonStyle = {
  backgroundColor: 'transparent',
  color: '#fff',
  border: '1px solid #555',
  borderRadius: '5px',
  padding: '5px 10px',
  cursor: 'pointer',
};

export default Header;
