import { Canvas, useFrame, useThree } from '@react-three/fiber' // Added useThree
import { ScrollControls } from '@react-three/drei'
import * as THREE from 'three'
import Ring from './components/Ring'
import './App.css'
import { useState } from 'react'

function Rig({ children }) {
  // We need to know the screen size to be responsive
  const { size } = useThree()
  
  useFrame((state, delta) => {
    // 1. RESPONSIVE DISTANCE (The "Cutoff" Fix)
    // Calculate aspect ratio (Width / Height)
    const aspect = size.width / size.height
    
    // Base distance is 28 (We pulled it in slightly from 38 so it's not too small on desktop)
    const baseZ = 28
    
    // If aspect is narrow (< 1), increase Z to fit everything.
    // If aspect is wide (> 1), stick to baseZ.
    const targetZ = aspect < 1 ? baseZ / aspect : baseZ

    // 2. MOUSE Y (Aerial View)
    // We increase the Y-travel to 14 for that dramatic look
    const targetY = Math.max(0, state.pointer.y * 14)
    
    // 3. SMOOTH MOVE (Lerp both Position Y and Z)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.05)
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.05)
    
    // 4. LOOK AT CENTER
    state.camera.lookAt(0, 0, 0)
  })
  
  return <group>{children}</group>
}

export default function App() {
  const [activeId, setActiveId] = useState(null)
  const [hoveredId, setHoveredId] = useState(null)

  return (
    // We set a default camera, but the Rig will immediately take over control
    <Canvas camera={{ position: [0, 0, 30], fov: 30 }}>
      <color attach="background" args={['#f0f0f0']} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
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