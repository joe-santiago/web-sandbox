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
    // Rotate the ring based solely on scroll
    const rotationOffset = scroll.offset * (Math.PI * 2)
    group.current.rotation.y = rotationOffset
  })

  // Radius 4.5 gives us the empty space in the center
  const radius = 4.5 
  const count = data.length

  return (
    // Tilt the whole ring slightly (-0.1) so we see the tops of cards
    <group ref={group} rotation={[-0.1, 0, 0]}>
      {data.map((item, index) => {
        const angle = (index / count) * Math.PI * 2
        
        // --- PHASE 2 LOGIC: THE ROLODEX ---
        // If the card is 'portrait', we must rotate it 90 degrees (Math.PI / 2) on Z
        // to make it lie on its side and fit the horizontal slot.
        const zRotation = item.orientation === 'portrait' ? Math.PI / 2 : 0

        return (
          <Card
            key={item.id}
            
            // 1. Layout Props (Where does it live in the ring?)
            gridPosition={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
            
            // 2. Rotation Props (How is it stored?)
            // We pass the calculated zRotation here!
            gridRotation={[0, angle, zRotation]}
            
            // 3. Data Props
            front={item.front}
            back={item.back}
            link={item.link}
            orientation={item.orientation} // We pass this so the Card knows its true shape
            
            // 4. State Props
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