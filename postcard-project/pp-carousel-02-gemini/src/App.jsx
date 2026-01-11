import { useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber' // <--- Added useFrame
import { ScrollControls } from '@react-three/drei'
import * as THREE from 'three' // <--- Added THREE for math
import Ring from './components/Ring'

// This component handles the subtle camera tilt
function Rig() {
  useFrame((state, delta) => {
    // Read mouse position (x and y are between -1 and 1)
    // Lerp (Linear Interpolation) smooths the movement
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, (state.mouse.x * 2), 0.05)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, (state.mouse.y * 1), 0.05)
    
    // Always look at the center of the scene
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

export default function App() {
  const [activeId, setActiveId] = useState(null)
  const [hoveredId, setHoveredId] = useState(null)

  return (
    <Canvas camera={{ position: [0, 0, 12], fov: 35 }}>
      {/* 1. Bright Background to match reference */}
      <color attach="background" args={['#f0f0f0']} />
      
      <ambientLight intensity={0.8} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
      
      {/* 2. Add the Rig here to control the camera */}
      <Rig />

      <ScrollControls pages={4} damping={0.2}>
        <Ring 
          activeId={activeId}
          hoveredId={hoveredId}
          onSelect={setActiveId}
          onHover={setHoveredId}
        /> 
      </ScrollControls>
    </Canvas>
  )
}