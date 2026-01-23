import { useRef, useEffect } from 'react'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { data } from '../data'
import Card from './Card'

export default function Ring({ activeId, hoveredId, onSelect, onHover, onFlip }) {
  const scroll = useScroll()

  // FIX: Nudge scroll position on mount to enable bidirectional scrolling
  // Without this, ScrollControls won't register down-scroll when starting at offset=0
  // We use a delay to ensure ScrollControls is fully initialized
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scroll.el) {
        // Tiny nudge down, then back - this "wakes up" the scroll system
        scroll.el.scrollTop = 1
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [scroll.el])

  // THE ODOMETER LOGIC
  // We use refs to track the loop count and unwrapped rotation
  // This persists across frames without causing re-renders
  const lastOffset = useRef(null) // null = "no reading yet"
  const loopCount = useRef(0)

  // We define a getter to calculate the live rotation frame-by-frame
  const getRotation = () => {
    const offset = scroll.offset

    // First frame: establish baseline, no wrap detection yet
    // Like an odometer that needs its first reading before tracking changes
    if (lastOffset.current === null) {
      lastOffset.current = offset
      return offset * (Math.PI * 2)
    }

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
            orientation={item.orientation}
            aspectRatio={item.aspectRatio}

            active={isActive}
            locked={isLocked}
            hovered={isHovered}

            onPointerOver={() => onHover(item.id)}
            onPointerOut={() => onHover(null)}
            onClick={() => onSelect(item.id)}
            onFlip={onFlip}
          />
        )
      })}
    </group>
  )
}