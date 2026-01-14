import { Canvas, useFrame } from '@react-three/fiber' // Added useFrame
import { ScrollControls } from '@react-three/drei'
import * as THREE from 'three' // Added THREE for math
import Ring from './components/Ring'
import './App.css'
import { useState } from 'react'

// THE RIG COMPONENT
// This acts as the "Cameraman"
function Rig({ children }) {
  useFrame((state, delta) => {
    // 1. READ MOUSE Y (-1 is bottom, +1 is top)
    // We map -1..1 to a Camera Y position of 0..12
    // If mouse is low, Y=0 (Eye level)
    // If mouse is high, Y=12 (Aerial view)
    const targetY = Math.max(0, state.pointer.y * 12)
    
    // 2. SMOOTH MOVE (Lerp)
    // We gently drift the camera to the new height
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y, 
      targetY, 
      0.05 // 5% movement per frame (Smooth)
    )
    
    // 3. ALWAYS LOOK AT CENTER
    state.camera.lookAt(0, 0, 0)
  })
  
  return <group>{children}</group>
}

export default function App() {
  const [activeId, setActiveId] = useState(null)
  const [hoveredId, setHoveredId] = useState(null)

  return (
    // Base Camera: Z=22 (slightly closer than 25 so it's not too small)
    <Canvas camera={{ position: [0, 0, 22], fov: 30 }}>
      <color attach="background" args={['#f0f0f0']} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* We wrap everything in the Rig so the camera reacts to the mouse */}
      <Rig>
        <ScrollControls pages={4} infinite>
          <Ring 
            activeId={activeId} 
            hoveredId={hoveredId}
            onSelect={setActiveId}
            onHover={setHoveredId}
          />
        </ScrollControls>
      </Rig>
    </Canvas>
  )
}