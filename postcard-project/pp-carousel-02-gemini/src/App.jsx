import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ScrollControls } from '@react-three/drei'
import Ring from './components/Ring'
// We will wire up ActiveCard in the next step, for now let's get the Ring working
// import ActiveCard from './components/ActiveCard' 

export default function App() {
  const [activeId, setActiveId] = useState(null)
  const [hoveredId, setHoveredId] = useState(null)

  return (
    <>
      <Canvas camera={{ position: [0, 0, 0], fov: 35 }}>
        {/* 1. Background Color */}
        <color attach="background" args={['#101010']} />
        
        {/* 2. Lighting (Essential for 3D) */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        {/* 3. Controls & Scene */}
        {/* 'pages' determines how long the scroll is. 4 pages = long scroll area */}
        <ScrollControls pages={4} damping={0.2}>
          <Ring 
            activeId={activeId}
            hoveredId={hoveredId}
            onSelect={setActiveId}
            onHover={setHoveredId}
          />
        </ScrollControls>
      </Canvas>

      {/* 4. Overlay UI (We will implement ActiveCard here later) */}
      {activeId && (
         <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', zIndex: 10 }}>
            Active ID: {activeId} <button onClick={() => setActiveId(null)}>Close</button>
         </div>
      )}
    </>
  )
}