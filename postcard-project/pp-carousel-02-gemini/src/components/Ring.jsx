import { useRef } from 'react'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { data } from '../data'
import Card from './Card'

export default function Ring({ activeId, hoveredId, onSelect, onHover }) {
  const scroll = useScroll()
  
  // THE ODOMETER LOGIC
  // We use refs to track the loop count and unwrapped rotation
  // This persists across frames without causing re-renders
  const rotationRef = useRef(0)
  const lastOffset = useRef(0)
  const loopCount = useRef(0)

  // We define a getter to calculate the live rotation frame-by-frame
  const getRotation = () => {
    const offset = scroll.offset
    const delta = offset - lastOffset.current
    
    // Detect Wrap (The Odometer Click)
    // If delta is huge (e.g., -0.9), we wrapped forward -> Add 1 loop
    // If delta is huge (e.g., +0.9), we wrapped backward -> Subtract 1 loop
    if (delta < -0.5) loopCount.current += 1
    if (delta > 0.5) loopCount.current -= 1
    
    lastOffset.current = offset
    
    // Total Rotation = (Loops + Current Position) * 360 degrees
    return (loopCount.current + offset) * (Math.PI * 2)
  }

  const radius = 5.0 
  const count = data.length

  return (
    <group rotation={[-0.1, 0, 0]}>
      {data.map((item, index) => {
        const startAngle = (index / count) * Math.PI * 2
        const zRotation = item.orientation === 'portrait' ? Math.PI / 2 : 0

        const isLocked = activeId === item.id
        const isHovered = hoveredId === item.id
        const isActive = isLocked || isHovered

        return (
          <Card
            key={item.id}
            
            // PROPS UPDATE:
            // We pass the getRotation function so the card can read the
            // clean, infinite odometer value every frame.
            getRotation={getRotation}
            
            startAngle={startAngle}
            radius={radius}
            // Removed 'scroll' prop (Card doesn't need raw scroll anymore)
            
            totalItems={count}
            zRotation={zRotation}
            
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