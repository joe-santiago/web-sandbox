import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { data } from '../data'
import Card from './Card'

export default function Ring({ activeId, hoveredId, onSelect, onHover }) {
  const group = useRef()
  const scroll = useScroll()

  useFrame((state, delta) => {
    // Rotation logic remains the same
    const rotationOffset = scroll.offset * (Math.PI * 2)
    group.current.rotation.y = rotationOffset
  })

  // Increased radius slightly to 5 to give the angled cards room to breathe
  const radius = 5 
  const count = data.length

  return (
    <group ref={group} rotation={[-0.1, 0, 0]}>
      {data.map((item, index) => {
        const angle = (index / count) * Math.PI * 2
        
        // --- PHASE 1: ANGLED EDGE LOGIC ---
        
        // 1. Z-Rotation (The Rolodex Logic): 
        // If portrait, rotate 90 deg to lie on side.
        const zRotation = item.orientation === 'portrait' ? Math.PI / 2 : 0

        // 2. Y-Rotation (The Louver Logic):
        // angle = Face Center
        // + Math.PI / 2 = Edge Face Center
        // - 0.25 = Slight angle (Louver) so we can see the image
        const yRotation = angle + (Math.PI / 2) - 0.25

        return (
          <Card
            key={item.id}
            
            gridPosition={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
            // We pass our new Louver rotation here
            gridRotation={[0, yRotation, zRotation]}
            
            front={item.front}
            back={item.back}
            link={item.link}
            orientation={item.orientation}
            
            active={activeId === item.id}
            hovered={hoveredId === item.id}
            onPointerOver={() => onHover(item.id)}
            onPointerOut={() => onHover(null)}
            onClick={() => activeId === item.id ? onSelect(null) : onSelect(item.id)}
          />
        )
      })}
    </group>
  )
}