import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Image } from '@react-three/drei'
import * as THREE from 'three'

export default function Card({ front, back, link, active, hovered, ...props }) {
  const ref = useRef()
  
  useFrame((state, delta) => {
    // Scale: Big if active, Medium if hovered
    const targetScale = active ? 1.7 : hovered ? 1.15 : 1
    ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), delta * 10)
    
    // Position: Move to center (z=2) if active
    const targetPos = active ? new THREE.Vector3(0, 0, 2) : new THREE.Vector3(0, 0, 0)
    ref.current.position.lerp(targetPos, delta * 10)
  })

  // Handle click: If active, open the link. If not, the parent (Ring) handles selection.
  const handleClick = (e) => {
    if (active && link) {
      window.open(link, '_blank') // Opens your mediabyjoe url in a new tab
      e.stopPropagation() // Prevents the click from passing through
    } else {
      props.onClick(e)
    }
  }

  return (
    <group {...props} ref={ref} onClick={handleClick}>
      {/* FRONT IMAGE */}
      <Image
        url={front} // <--- Fixing the crash: Using 'front' prop
        transparent
        side={THREE.DoubleSide}
        radius={0.075}
        scale={[1.618, 2.5]} 
        position={[0, 0, 0.01]}
      />

      {/* BACK IMAGE */}
      <Image
        url={back} // <--- Fixing the crash: Using 'back' prop
        transparent
        side={THREE.DoubleSide}
        radius={0.075}
        scale={[1.618, 2.5]}
        position={[0, 0, -0.01]}
        rotation={[0, Math.PI, 0]}
      />
    </group>
  )
}