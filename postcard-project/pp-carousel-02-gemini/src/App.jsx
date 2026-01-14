import { useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ScrollControls } from '@react-three/drei'
import * as THREE from 'three'
import Ring from './components/Ring'

function Rig() {
  useFrame((state, delta) => {
    // Read mouse position (x and y are between -1 and 1)
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, (state.mouse.x * 2), 0.05)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, (state.mouse.y * 1), 0.05)
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

export default function App() {
  const [activeId, setActiveId] = useState(null)
  const [hoveredId, setHoveredId] = useState(null)

  return (
    <Canvas camera={{ position: [0, 0, 12], fov: 35 }}>
      {/* 1. Bright Background */}
      <color attach="background" args={['#f0f0f0']} />
      
      <ambientLight intensity={0.8} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
      
      {/* 2. Camera Rig */}
      <Rig />

      {/* 3. Controls & Scene */}
      {/* We added the 'infinite' prop here */}
      <ScrollControls pages={4} damping={0.2} infinite>
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