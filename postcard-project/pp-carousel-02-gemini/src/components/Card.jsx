import { useRef, useState, useEffect } from 'react' // <--- Added useState, useEffect
import { useFrame } from '@react-three/fiber'
import { Image } from '@react-three/drei'
import * as THREE from 'three'

export default function Card({ front, back, link, active, hovered, gridPosition, gridRotation, ...props }) {
  const ref = useRef()
  // New state to track if the card is currently flipped to the back
  const [isFlipped, setIsFlipped] = useState(false)

  // Reset flip state whenever the card becomes inactive (goes back to ring)
  useEffect(() => {
    if (!active) setIsFlipped(false)
  }, [active])
  
  useFrame((state, delta) => {
    // --- POSITION & SCALE (Same as before) ---
    const homePos = new THREE.Vector3(...gridPosition)
    const targetPos = active ? new THREE.Vector3(0, 0, 2) : homePos
    ref.current.position.lerp(targetPos, delta * 10)

    const targetScale = active ? 1.7 : hovered ? 1.15 : 1
    ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), delta * 10)

    // --- ROTATION (New Flip Logic) ---
    // Determine target Y rotation based on state
    let targetY = gridRotation[1] // Default: follow the ring rotation
    if (active) {
      // If active, Y is either 0 (Front) or Math.PI (Back/Flipped)
      targetY = isFlipped ? Math.PI : 0
    }

    // Determine target X and Z (Flatten out when active)
    const targetX = active ? 0 : gridRotation[0]
    const targetZ = active ? 0 : gridRotation[2]

    // Smoothly animate to targets
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, targetX, delta * 10)
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, targetY, delta * 10)
    ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, targetZ, delta * 10)
  })

  // --- NEW CLICK HANDLER ---
  const handleClick = (e) => {
    e.stopPropagation() // Stop click from hitting things behind the card

    if (active) {
      // If card is already in center...
      if (isFlipped && link) {
        // 3. If Back is showing: Open URL
        window.open(link, '_blank')
      } else {
        // 2. If Front is showing: Flip it
        setIsFlipped(true)
      }
    } else {
      // 1. If card is in ring: Activate it (zoom to center)
      props.onClick(e)
    }
  }

  return (
    <group {...props} ref={ref} onClick={handleClick}>
      <Image url={front} transparent side={THREE.DoubleSide} radius={0.075} scale={[1.618, 2.5]} position={[0, 0, 0.01]} />
      {/* Back image is rotated 180deg (Math.PI) so it shows when flipped */}
      <Image url={back} transparent side={THREE.DoubleSide} radius={0.075} scale={[1.618, 2.5]} position={[0, 0, -0.01]} rotation={[0, Math.PI, 0]} />
    </group>
  )
}