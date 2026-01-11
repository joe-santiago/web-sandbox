import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import { easing } from 'maath'
import Card from './Card'
import { data } from '../data'

export default function Ring({ onHover, onSelect, activeId, hoveredId }) {
  const ref = useRef()
  const scroll = useScroll()

  // --- NEW: DYNAMIC LAYOUT CALCULATION ---
  const numItems = data.length
  // 1. Calculate required circumference (roughly 1.6 units per card)
  // 2. Derive radius: r = C / 2PI
  // 3. Ensure a minimum radius of 3 so small lists don't look cramped
  const radius = Math.max(3, (numItems * 1.6) / (2 * Math.PI))
  
  // Adjust camera distance: If the ring grows, move camera back
  const cameraDist = 14 + (radius - 3) // Start at 14, add depth as radius grows

  useFrame((state, delta) => {
    ref.current.rotation.y = -scroll.offset * (Math.PI * 2)

    easing.damp3(
      state.camera.position,
      [
        -state.pointer.x * 2,
        state.pointer.y * 2,
        cameraDist // <--- Updated to be dynamic
      ], 
      0.3, 
      delta
    )
  })

  return (
    <group ref={ref}>
      {data.map((item, index) => {
        const angle = (index / numItems) * Math.PI * 2
        const x = Math.sin(angle) * radius
        const z = Math.cos(angle) * radius

        return (
          <Card
            key={item.id}
            url={item.front}
            back={item.back}
            position={[x, 0, z]}
            rotation={[0, angle, 0]}
            active={activeId === item.id}
            hovered={hoveredId === item.id}
            onPointerOver={() => onHover && onHover(item.id)}
            onPointerOut={() => onHover && onHover(null)}
            onClick={() => onSelect && onSelect(item.id)}
          />
        )
      })}
    </group>
  )
}