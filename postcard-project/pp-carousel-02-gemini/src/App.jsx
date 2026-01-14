import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScrollControls } from '@react-three/drei'
import * as THREE from 'three'
import Ring from './components/Ring'
import './App.css'
import { useState } from 'react'

function Rig({ children }) {
  const { size } = useThree()
  
  useFrame((state, delta) => {
    // 1. RESPONSIVE DISTANCE
    const aspect = size.width / size.height
    const baseZ = 28
    const targetZ = aspect < 1 ? baseZ / aspect : baseZ

    // 2. MOUSE Y (The "Always Above" Fix)
    // We Map the range -1..1 (Mouse) to 5..15 (Camera Height)
    // (state.pointer.y + 1) / 2 converts the mouse range to 0..1
    const minHeight = 5
    const maxHeight = 15
    const targetY = THREE.MathUtils.lerp(minHeight, maxHeight, (state.pointer.y + 1) / 2)
    
    // 3. SMOOTH MOVE
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