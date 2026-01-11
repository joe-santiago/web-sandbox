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
    const rotationOffset = scroll.offset * (Math.PI * 2)
    group.current.rotation.y = rotationOffset
  })

  const radius = 2.8 
  const count = data.length

  return (
    <group ref={group} rotation={[-0.2, 0, 0]}>
      {data.map((item, index) => {
        const angle = (index / count) * Math.PI * 2
        return (
          <Card
            key={item.id}
            
            // Pass all data props
            front={item.front}
            back={item.back}
            link={item.link} 
            
            position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
            rotation={[0, angle, 0]} 
            
            active={activeId === item.id}
            hovered={hoveredId === item.id}
            onPointerOver={() => onHover(item.id)}
            onPointerOut={() => onHover(null)}
            // Select the card if it isn't already active
            onClick={() => activeId === item.id ? null : onSelect(item.id)}
          />
        )
      })}
    </group>
  )
}