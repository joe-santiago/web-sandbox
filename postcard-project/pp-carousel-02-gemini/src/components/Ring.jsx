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
    // FIX: Removed the "if (!activeId)" check.
    // The ring now ALWAYS rotates based on scroll, even if a card is locked.
    const rotationOffset = scroll.offset * (Math.PI * 2)
    group.current.rotation.y = rotationOffset
  })

  const radius = 5.0 
  const count = data.length

  return (
    <group ref={group} rotation={[-0.1, 0, 0]}>
      {data.map((item, index) => {
        const angle = (index / count) * Math.PI * 2
        const zRotation = item.orientation === 'portrait' ? Math.PI / 2 : 0
        const yRotation = angle + (Math.PI / 2) - 0.25

        // STATE LOGIC
        const isLocked = activeId === item.id
        const isHovered = hoveredId === item.id
        const isActive = isLocked || isHovered

        return (
          <Card
            key={item.id}
            gridPosition={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
            gridRotation={[0, yRotation, zRotation]}
            front={item.front}
            back={item.back}
            link={item.link}
            orientation={item.orientation}
            aspectRatio={item.aspectRatio}
            
            active={isActive}
            locked={isLocked}
            hovered={isHovered}
            
            onPointerOver={() => onHover(item.id)}
            onPointerOut={() => onHover(null)}
            onClick={() => onSelect(item.id)}
          />
        )
      })}
    </group>
  )
}