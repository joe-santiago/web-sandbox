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
            
            // WE CHANGE THIS: Pass the calculated layout as "gridPosition"
            gridPosition={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
            gridRotation={[0, angle, 0]}
            
            // Pass the rest of the data
            front={item.front}
            back={item.back}
            link={item.link}
            
            active={activeId === item.id}
            hovered={hoveredId === item.id}
            onPointerOver={() => onHover(item.id)}
            onPointerOut={() => onHover(null)}
            onClick={() => onSelect(activeId === item.id ? null : item.id)}
          />
        )
      })}
    </group>
  )
}