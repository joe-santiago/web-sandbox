import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Image } from '@react-three/drei'
import * as THREE from 'three'

// Destructure gridPosition and gridRotation from props
export default function Card({ front, back, link, active, hovered, gridPosition, gridRotation, ...props }) {
  const ref = useRef()
  
  useFrame((state, delta) => {
    // 1. POSITION LOGIC
    // If Active: Go to Center (0, 0, 2)
    // If Inactive: Go to your assigned Grid Position
    const homePos = new THREE.Vector3(...gridPosition)
    const targetPos = active ? new THREE.Vector3(0, 0, 2) : homePos
    ref.current.position.lerp(targetPos, delta * 10)

    // 2. ROTATION LOGIC
    // If Active: Face the camera (0,0,0)
    // If Inactive: Face outward (gridRotation)
    if (active) {
        ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, 0, delta * 10)
        ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, 0, delta * 10)
        ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, 0, delta * 10)
    } else {
        ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, gridRotation[0], delta * 10)
        ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, gridRotation[1], delta * 10)
        ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, gridRotation[2], delta * 10)
    }

    // 3. SCALE LOGIC
    const targetScale = active ? 1.7 : hovered ? 1.15 : 1
    ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), delta * 10)
  })

  const handleClick = (e) => {
    if (active && link) {
      window.open(link, '_blank')
      e.stopPropagation()
    } else {
      props.onClick(e)
    }
  }

  return (
    <group {...props} ref={ref} onClick={handleClick}>
      <Image
        url={front}
        transparent
        side={THREE.DoubleSide}
        radius={0.075}
        scale={[1.618, 2.5]} 
        position={[0, 0, 0.01]}
      />
      <Image
        url={back}
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